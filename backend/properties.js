const pool = require("./db");
const express = require("express");
const router = express.Router();

// helper funciton
function validateQueryParam(filter, value) {
    if (value === undefined) {
        return null;
    }

    if (value.trim() === "") {
        return { status: "error", error: `${filter} cannot be left blank` };
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return { status: "error", error: `${filter} must be a number` };
    }
    
    if (!Number.isInteger(number)) {
        return { status: "error", error: `${filter} must be an integer` };
    }

    if (number < 0) {
        return { status: "error", error: `${filter} must be a non-negative number` };
    }

    return { value: number }
}

const validateListingId = (req, res, next) => {
    const id = req.params.id;

    if (!/^[0-9]{9,10}$/.test(id)) {
        return res.status(400).json({
            status: "error", 
            error: "Incorrect property id format"
        });
    }

    next();
};

router.get("/", async (req, res) => {
    try {
        let limit = 20;
        let offset = 0;

        if (req.query.limit !== undefined) {
            const input = validateQueryParam("Limit", req.query.limit);
            if (input.error || input.value === 0 || input.value > 100) {
                return res.status(400).json({
                    status: "error",
                    error: "Limit must be an integer between 1-100"
                });
            }

            limit = input.value;
        }

        if (req.query.offset !== undefined) {
            const input = validateQueryParam("Offset", req.query.offset);
            if (input.error) {
                return res.status(400).json({
                    status: "error",
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
                    status: "error",
                    error: "City cannot be left blank"
                });
            }

            if (/^\d+$/.test(city)) {
                return res.status(400).json({
                    status: "error",
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
                    status: "error",
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
                    status: "error",
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
                    status: "error",
                    error: input.error
                });
            }

            conditions.push("L_SystemPrice <= ?");
            values.push(input.value);
            maxPrice = input.value;
        }

        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            return res.status(400).json({
                status: "error",
                error: "MinPrice cannot be greater than maxPrice"
            });
        }

        if (req.query.beds !== undefined) {
            const input = validateQueryParam("Beds", req.query.beds);
            if (input.error) {
                return res.status(400).json({
                    status: "error",
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
                    status: "error",
                    error: "Baths cannot be left blank"
                });
            }

            const baths = Number(bathsInput);

            if (!Number.isFinite(baths) || baths < 0) {
                return res.status(400).json({
                    status: "error",
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
        const [totalItems] = await pool.query(
            "SELECT COUNT(*) AS total FROM rets_property" + whereClause,
            values
        );
        const total = totalItems[0].total;

        // find result
        const dataValues = [...values, limit, offset];
        const [items] = await pool.query(
            "SELECT * FROM rets_property" + whereClause + " LIMIT ? OFFSET ?",
            dataValues
        );

        res.json({
            total: total,
            limit: limit,
            offset: offset,
            results: items
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
})

router.get("/:id/openhouses", validateListingId, async (req, res) => {
    try {
        const id = req.params.id;

        const [item] = await pool.query(
            "SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?",
            [id]
        );

        if (item.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "Property not found"
            });
        }

        const [events] = await pool.query(
            `SELECT * FROM rets_openhouse 
            WHERE L_ListingID = ? 
            ORDER BY OpenHouseDate, OH_StartTime`,
            [id]
        );

        return res.json(events);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
})

router.get("/:id", validateListingId, async (req, res) => {
    try {
        const id = req.params.id;

        const sql = "SELECT * FROM rets_property WHERE L_ListingID = ?"

        const [item] = await pool.query(
            "SELECT * FROM rets_property WHERE L_ListingID = ?",
            [id]
        );

        if (item.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Property not found"
            });
        }

        return res.json(item);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
})

module.exports = router;
