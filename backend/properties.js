const pool = require("./db");
const express = require("express");
const router = express.Router();

// helper funciton
function validateQueryParam(filter, value) {
    if (value === undefined) {
        return null;
    }

    if (value.trim() === "") {
        return { error: `${filter} cannot be left blank` };
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return { error: `${filter} must be a number` };
    }
    
    if (!Number.isInteger(number)) {
        return { error: `${filter} must be an integer` };
    }

    if (number < 0) {
        return { error: `${filter} must be a non-negative number` };
    }

    return { value: number }
}

router.get("/", async(req, res) => {
    try {
        let limit = 20;
        let offset = 0;

        if (req.query.limit !== undefined) {
            const input = validateQueryParam("Limit", req.query.limit);
            if (input.error || input.value === 0 || input.value > 20) {
                return res.status(400).json({
                    error: "Limit must be an integer between 1-20"
                });
            }

            limit = input.value;
        }

        if (req.query.offset !== undefined) {
            const input = validateQueryParam("Offset", req.query.offset);
            if (input.error) {
                return res.status(400).json({
                    error: input.error
                });
            }
            
            offset = input.value;
        }

        const conditions = [];
        const values = [];

        if (req.query.city !== undefined) {
            const city = req.query.city.trim();
            if (city === "") {
                return res.status(400).json({
                    error: "City cannot be left blank"
                });
            }

            if (/^\d+$/.test(city)) {
                return res.status(400).json({
                    error: "City must be a valid city name"
                });
            }

            conditions.push(
                "LOWER(TRIM(L_City)) = LOWER(TRIM(?))"
            );
            values.push(city);
        }

        if (req.query.zipcode !== undefined) {
            const zipcode = req.query.zipcode.trim();
            if (!/^\d{5}$/.test(zipcode)) {
                return res.status(400).json({
                    error: "Zipcode must be exactly 5 digits"
                });
            }

            conditions.push("L_Zip = ?");
            values.push(zipcode);
        }

        let minPrice;
        let maxPrice;

        if (req.query.minPrice !== undefined) {
            const input = validateQueryParam("MinPrice", req.query.minPrice);
            if (input.error) {
                return res.status(400).json({
                    error: input.error
                });
            }

            conditions.push("L_SystemPrice >= ?");
            values.push(input.value);
            minPrice = input.value;
        }

        if (req.query.maxPrice !== undefined) {
            const input = validateQueryParam("MaxPrice", req.query.maxPrice);
            if (input.error) {
                return res.status(400).json({
                    error: input.error
                });
            }

            conditions.push("L_SystemPrice <= ?");
            values.push(input.value);
            maxPrice = input.value;
        }

        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            return res.status(400).json({
                error: "MinPrice cannot be greater than maxPrice"
            });
        }

        if (req.query.beds !== undefined) {
            const input = validateQueryParam("Beds", req.query.beds);
            if (input.error) {
                return res.status(400).json({
                    error: input.error
                });
            }

            conditions.push("L_Keyword2 = ?");
            values.push(input.value);
        }

        if (req.query.baths !== undefined) {
            /* 
                LM_Dec_3 is the simple sum of the number of bathrooms
                For example, 2.5 bathrooms appears as a total of 3
             */

            const bathsInput = req.query.baths.trim();

            if (bathsInput === "") {
                return res.status(400).json({
                    error: "Baths cannot be left blank"
                });
            }

            const baths = Number(bathsInput);

            if (!Number.isFinite(baths) || baths < 0) {
                return res.status(400).json({
                    error: " Baths must be a non-negative number"
                });
            }

            conditions.push("LM_Dec_3 = ?");
            values.push(baths);
        }
        
        let whereClause = "";

        if (conditions.length > 0) {
            whereClause = " WHERE " + conditions.join(" AND ");
        }

        // find total count
        const countSql = "SELECT COUNT(*) AS total FROM rets_property" + whereClause;
        const [totalItems] = await pool.query(countSql, values);
        const total = totalItems[0].total;

        // find result
        const sql = "SELECT * FROM rets_property" + whereClause + " LIMIT ? OFFSET ?";
        const dataValues = [...values, limit, offset];
        const [items] = await pool.query(sql, dataValues);

        res.json({
            total: total,
            limit: limit,
            offset: offset,
            results: items
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})

module.exports = router;
