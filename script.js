document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payoff-form');
    const resultsDiv = document.getElementById('results');
    let payoffChart = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculatePayoff();
    });

    // Add event listeners for real-time calculations
    ['balance', 'apr', 'payment'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculatePayoff);
    });

    function calculatePayoff() {
        const balance = parseFloat(document.getElementById('balance').value) || 0;
        const apr = (parseFloat(document.getElementById('apr').value) || 0) / 100 / 12; // Monthly interest rate
        const payment = parseFloat(document.getElementById('payment').value) || 0;

        if (balance > 0 && payment > 0) {
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

            displayResults(months, totalInterest, totalPaid);
            updateChart(balanceData);
            resultsDiv.classList.remove('hidden');
        }
    }

    function displayResults(months, totalInterest, totalPaid) {
        document.getElementById('payoffTime').textContent = `${Math.floor(months / 12)} years and ${months % 12} months`;
        document.getElementById('totalInterest').textContent = `$${totalInterest.toFixed(2)}`;
        document.getElementById('totalPaid').textContent = `$${totalPaid.toFixed(2)}`;
    }

    function updateChart(balanceData) {
        const ctx = document.getElementById('payoffChart').getContext('2d');
        
        if (payoffChart) {
            payoffChart.destroy();
        }

        payoffChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: balanceData.length}, (_, i) => i),
                datasets: [{
                    label: 'Balance Over Time',
                    data: balanceData,
                    borderColor: '#008cd2',
                    backgroundColor: 'rgba(0, 140, 210, 0.1)',
                    fill: true
                }]
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
