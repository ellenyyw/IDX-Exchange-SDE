require("dotenv").config();

const pool = require("./db");

async function testMinPriceAndBeds() {
    try {
        const minPrice = 300000;
        const beds = 3;

        // Get expected result from database
        const [items] = await pool.query(
            `SELECT COUNT(*) AS total
            FROM rets_property
            WHERE L_SystemPrice >= ?
            AND L_Keyword2 = ?`,
            [minPrice, beds]
        );
        const expectedTotal = items[0].total;

        // Test Case 1: beds first, minPrice second
        const response1 = await fetch(
            `http://localhost:5000/api/properties?beds=${beds}&minPrice=${minPrice}`
        );

        const data1 = await response1.json();
        const actualTotal1 = data1.total;

        if (actualTotal1 === expectedTotal) {
            console.log("TESTCASE 1 PASS");
        } else {
            console.log(
                "TESTCASE 1 FAIL: result count is wrong when minPrice and beds are applied together"
            );
            console.log("Actual:", actualTotal1);
            console.log("Expected:", expectedTotal);
        }

        // Test Case 2: minPrice first, beds second
        const response2 = await fetch(
            `http://localhost:5000/api/properties?minPrice=${minPrice}&beds=${beds}`
        );

        const data2 = await response2.json();
        const actualTotal2 = data2.total;

        if (actualTotal2 === expectedTotal) {
            console.log("TESTCASE 2 PASS");
        } else {
            console.log(
                "TESTCASE 2 FAIL: result count is wrong when minPrice and beds are applied together"
            );
            console.log("Actual:", actualTotal2);
            console.log("Expected:", expectedTotal);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

testMinPriceAndBeds();
