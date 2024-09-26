/* General Styles */
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
    background-color: #f4f4f4;
}

.calculator-container {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1, h2 {
    color: #333;
    text-align: center;
}

.input-section {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 20px;
}

.input-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input[type="number"],
input[type="text"],
select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

/* Button styles */
button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
    border-radius: 4px;
}

button:hover {
    background-color: #0056b3;
}

/* Goal buttons */
.goal-button {
    width: 48%;
    padding: 10px;
    border: none;
    border-radius: 4px;
    background-color: grey; /* Default non-selected button */
    color: white;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
    margin-right: 10px;
}

.goal-button.selected {
    background-color: #F6941F; /* Orange for selected button */
    color: white;
}

.goal-button:hover {
    opacity: 0.8;
}

/* Results Section */
.results-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.result-item {
    background-color: #fff;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-label {
    font-weight: bold;
    color: #555;
}

.result-value {
    font-size: 18px;
    color: black; /* Changed to black */
    display: block;
    margin-top: 5px;
}

/* Actionable Insights */
#actionableInsight {
    margin-top: 20px;
    padding: 10px;
    background-color: #fff3cd;
    border-left: 5px solid #ffc107;
    color: #856404;
}

/* Chart Styles */
#payoffChart {
    margin-top: 20px;
}

/* Payment Comparison Table */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th, td {
    padding: 12px;
    text-align: center;
    border: 1px solid #ddd;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
}

tr:nth-child(even) {
    background-color: #f8f8f8;
}

/* Highlight animation for results */
.highlight {
    animation: highlight 1s ease-in-out;
}

@keyframes highlight {
    0% { background-color: #ffff99; }
    100% { background-color: transparent; }
}

/* Hide the share results button */
#shareResults {
    display: none;
}

/* Balance Transfer Recommendation Styles */
.recommendation-section {
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 5px;
    padding: 20px;
    margin-top: 20px;
}

.recommendation-section h2 {
    color: #0050b3;
    margin-top: 0;
}

.card-info {
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 15px;
}

.card-info h3 {
    margin-top: 0;
    color: #1890ff;
}

.savings-info {
    text-align: center;
}

.savings-info h3 {
    color: #52c41a;
    font-size: 24px;
}

.disclaimer {
    font-size: 12px;
    color: #8c8c8c;
    margin-top: 15px;
}
