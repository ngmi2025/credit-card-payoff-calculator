document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payoff-form');
    const resultsDiv = document.getElementById('results');
    let payoffChart = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculatePayoff();
    });

    // Add event listeners for real-time calculations
    ['balance', 'apr', 'minPayment', 'extraPayment', 'goalDate'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculatePayoff);
    });

    function calculatePayoff() {
        const balance = parseFloat(document.getElementById('balance').value) || 0;
        const apr = (parseFloat(document.getElementById('apr').value) || 0) / 100 / 12; // Monthly interest rate
        const minPayment = parseFloat(document.getElementById('minPayment').value) || 0;
        const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;
        const goalDate = new Date(document.getElementById('goalDate').value);

        if (balance > 0 && minPayment > 0) {
            const scenarios = [
                { name: 'Minimum Payment', payment: minPayment },
                { name: 'Minimum + Extra', payment: minPayment + extraPayment }
            ];

            let scenarioResults = '';
            let chartData = [];

            scenarios.forEach(scenario => {
                const result = calculateScenario(balance, apr, scenario.payment);
                scenarioResults += `
                    <div class="scenario">
                        <h3>${scenario.name}</h3>
                        <p>Time to pay off: ${result.months} months</p>
                        <p>Total interest paid: $${result.totalInterest.toFixed(2)}</p>
                        <p>Total amount paid: $${result.totalPaid.toFixed(2)}</p>
                    </div>
                `;
                chartData.push({
                    label: scenario.name,
                    data: result.balanceData
                });
            });

            document.getElementById('scenarioResults').innerHTML = scenarioResults;
            updateChart(chartData);

            // Calculate interest saved
            const interestSaved = scenarios[0].totalInterest - scenarios[1].totalInterest;
            document.getElementById('interestSaved').innerHTML = `
                <h3>Interest Saved</h3>
                <p>By making extra payments, you could save $${interestSaved.toFixed(2)} in interest!</p>
            `;

            // Goal setting feature
            if (!isNaN(goalDate.getTime())) {
                const monthsToGoal = Math.ceil((goalDate - new Date()) / (1000 * 60 * 60 * 24 * 30));
                const requiredPayment = calculateRequiredPayment(balance, apr, monthsToGoal);
                document.getElementById('goalResults').innerHTML = `
                    <h3>Goal Payment</h3>
                    <p>To pay off your balance by ${goalDate.toLocaleDateString()}, you need to pay $${requiredPayment.toFixed(2)} per month.</p>
                `;
            }

            // Tips and educational content
            document.getElementById('tips').innerHTML = `
                <h3>Tips for Paying Off Credit Card Debt</h3>
                <ul>
                    <li>Always pay more than the minimum payment if possible.</li>
                    <li>Consider transferring your balance to a card with a lower APR.</li>
                    <li>Create a budget to allocate more money towards debt repayment.</li>
                    <li><a href="https://upgradedpoints.com/credit-cards/how-to-pay-off-credit-card-debt/" target="_blank">Read more about paying off credit card debt</a></li>
                </ul>
            `;

            resultsDiv.classList.remove('hidden');
        }
    }

    function calculateScenario(balance, apr, payment) {
        let months = 0;
        let totalInterest = 0;
        let remainingBalance = balance;
        let totalPaid = 0;
        const balanceData = [balance];

        while (remainingBalance > 0) {
            const interest = remainingBalance * apr;
            totalInterest += interest;
            remainingBalance += interest - payment;
            totalPaid += payment;
            months++;

            if (remainingBalance > 0) {
                balanceData.push(remainingBalance);
            } else {
                balanceData.push(0);
                totalPaid += remainingBalance; // Add the final payment
            }
        }

        return { months, totalInterest, totalPaid, balanceData };
    }

    function calculateRequiredPayment(balance, apr, months) {
        return (balance * apr * Math.pow(1 + apr, months)) / (Math.pow(1 + apr, months) - 1);
    }

    function updateChart(datasets) {
        const ctx = document.getElementById('payoffChart').getContext('2d');
        
        if (payoffChart) {
            payoffChart.destroy();
        }

        payoffChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: Math.max(...datasets.map(d => d.data.length))}, (_, i) => i),
                datasets: datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: index === 0 ? '#002f6c' : '#008cd2',
                    backgroundColor: index === 0 ? 'rgba(0, 47, 108, 0.1)' : 'rgba(0, 140, 210, 0.1)',
                    fill: true
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Balance ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Months'
                        }
                    }
                }
            }
        });
    }
});
