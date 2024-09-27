document.addEventListener('DOMContentLoaded', function() {
    const timeGoalButton = document.getElementById('timeGoal');
    const fixedPaymentButton = document.getElementById('fixedPayment');
    const timeGoalInput = document.getElementById('timeGoalInput');
    const fixedPaymentInput = document.getElementById('fixedPaymentInput');
    const calculateButton = document.getElementById('calculate');
    const resultsDiv = document.getElementById('results');
    const paymentTableDiv = document.getElementById('paymentTable');
    let payoffChart;

    function toggleGoalSelection(selectedButton, otherButton) {
        selectedButton.classList.add('selected');
        otherButton.classList.remove('selected');
        if (selectedButton === timeGoalButton) {
            timeGoalInput.style.display = 'block';
            fixedPaymentInput.style.display = 'none';
        } else {
            timeGoalInput.style.display = 'none';
            fixedPaymentInput.style.display = 'block';
        }
    }

    timeGoalButton.addEventListener('click', () => toggleGoalSelection(timeGoalButton, fixedPaymentButton));
    fixedPaymentButton.addEventListener('click', () => toggleGoalSelection(fixedPaymentButton, timeGoalButton));

    calculateButton.addEventListener('click', function(event) {
        event.preventDefault();
        try {
            calculatePayoff();
        } catch (error) {
            console.error('Error in calculatePayoff:', error);
            alert('An error occurred while calculating. Please check your inputs and try again.');
        }
    });

    function calculatePayoff() {
        const balance = parseFloat(document.getElementById('balance').value);
        const annualInterestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const monthlyInterestRate = annualInterestRate / 12;
        const payoffGoal = document.querySelector('.goal-button.selected').id;
        let monthlyPayment, monthsToPay;

        if (isNaN(balance) || isNaN(annualInterestRate) || balance <= 0 || annualInterestRate < 0) {
            throw new Error('Invalid balance or interest rate');
        }

        if (payoffGoal === 'timeGoal') {
            monthsToPay = parseInt(document.getElementById('monthsToPay').value);
            if (isNaN(monthsToPay) || monthsToPay <= 0) {
                throw new Error('Invalid months to pay');
            }
            monthlyPayment = calculateMonthlyPayment(balance, monthlyInterestRate, monthsToPay);
        } else {
            monthlyPayment = parseFloat(document.getElementById('fixedMonthlyPayment').value);
            if (isNaN(monthlyPayment) || monthlyPayment <= 0) {
                throw new Error('Invalid fixed monthly payment');
            }
            const minimumPayment = balance * monthlyInterestRate;
            if (monthlyPayment <= minimumPayment) {
                const minimumPaymentSuggestion = (minimumPayment + 1).toFixed(2);
                alert(`The monthly payment of $${monthlyPayment.toFixed(2)} is too low to pay off the balance. It needs to be at least $${minimumPaymentSuggestion} to cover the monthly interest and make progress on the principal. At your current payment rate, the balance will continue to grow due to accruing interest.`);
                return;
            }
            monthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, monthlyPayment);
        }

        const totalInterest = calculateTotalInterest(balance, monthlyPayment, monthsToPay);
        const startDate = new Date();
        const payOffDate = new Date(startDate.getTime() + monthsToPay * 30 * 24 * 60 * 60 * 1000);

        displayResults(monthlyPayment, startDate, payOffDate, totalInterest);
        displayPaymentTable(balance, monthlyInterestRate, monthlyPayment, totalInterest, startDate);
        displayActionableInsight(monthlyPayment, totalInterest, monthsToPay);
        displayPayoffChart(balance, monthlyPayment, monthsToPay, startDate);
        displayBalanceTransferRecommendation(balance, totalInterest);

        resultsDiv.classList.add('highlight');
        setTimeout(() => resultsDiv.classList.remove('highlight'), 1000);
    }

    function calculateMonthlyPayment(balance, monthlyInterestRate, months) {
        return (balance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / (Math.pow(1 + monthlyInterestRate, months) - 1);
    }

    function calculateMonthsToPay(balance, monthlyInterestRate, monthlyPayment) {
        return Math.ceil(Math.log(monthlyPayment / (monthlyPayment - balance * monthlyInterestRate)) / Math.log(1 + monthlyInterestRate));
    }

    function calculateTotalInterest(balance, monthlyPayment, months) {
        let totalInterest = 0;
        let remainingBalance = balance;
        const monthlyInterestRate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;

        for (let i = 0; i < months; i++) {
            const interestThisMonth = remainingBalance * monthlyInterestRate;
            totalInterest += interestThisMonth;
            remainingBalance -= (monthlyPayment - interestThisMonth);
            if (remainingBalance <= 0) break;
        }

        return totalInterest;
    }

    function displayResults(monthlyPayment, startDate, payOffDate, totalInterest) {
        document.getElementById('monthlyPayment').innerHTML = `<span class="result-label">Monthly Payment:</span><br><span class="result-value">$${Math.round(monthlyPayment)}</span>`;
        document.getElementById('startDate').innerHTML = `<span class="result-label">Start Date:</span><br><span class="result-value">${startDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>`;
        document.getElementById('payOffDate').innerHTML = `<span class="result-label">Pay Off Date:</span><br><span class="result-value">${payOffDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>`;
        document.getElementById('totalInterest').innerHTML = `<span class="result-label">Total Interest:</span><br><span class="result-value">$${Math.round(totalInterest)}</span>`;
        resultsDiv.style.display = 'block';
    }

    function displayPaymentTable(balance, monthlyInterestRate, baseMonthlyPayment, baseTotalInterest, startDate) {
        const tableBody = document.getElementById('paymentTableBody');
        tableBody.innerHTML = '';

        // Calculate base months to pay and base interest
        const baseMonthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, baseMonthlyPayment);
        const baseInterest = calculateTotalInterest(balance, baseMonthlyPayment, baseMonthsToPay);

        const payments = [
            baseMonthlyPayment,
            baseMonthlyPayment * 1.05,
            baseMonthlyPayment * 1.1,
            baseMonthlyPayment * 1.15,
            baseMonthlyPayment * 1.2
        ];

        // Loop through the different payment amounts
        payments.forEach(payment => {
            const months = calculateMonthsToPay(balance, monthlyInterestRate, payment);
            const interest = calculateTotalInterest(balance, payment, months);

            // Calculate interest savings compared to the base payment
            const savings = baseInterest - interest;
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = `$${payment.toFixed(2)}`;
            row.insertCell(1).textContent = savings > 0 ? `$${savings.toFixed(2)}` : `$0.00`;  // Ensure savings is never negative
            row.insertCell(2).textContent = months;
        });

        paymentTableDiv.style.display = 'block';
    }

    function displayActionableInsight(monthlyPayment, totalInterest, monthsToPay) {
        const increasedPayment = monthlyPayment * 1.1;
        const balance = parseFloat(document.getElementById('balance').value);
        const annualInterestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const monthlyInterestRate = annualInterestRate / 12;
        const newMonthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, increasedPayment);
        const newTotalInterest = calculateTotalInterest(balance, increasedPayment, newMonthsToPay);
        const interestSavings = Math.max(0, totalInterest - newTotalInterest);
        const timeSavings = Math.max(0, monthsToPay - newMonthsToPay);

        const insightElement = document.getElementById('actionableInsight');
        insightElement.textContent = `By increasing your monthly payment to $${Math.round(increasedPayment)}, you could save $${Math.round(interestSavings)} in interest and pay off your balance ${timeSavings} months earlier.`;
    }

    function displayPayoffChart(balance, monthlyPayment, monthsToPay, startDate) {
        const ctx = document.getElementById('payoffChart').getContext('2d');
        const labels = [];
        const balanceData = [];
        let currentBalance = balance;
        const monthlyInterestRate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;

        for (let i = 0; i <= monthsToPay; i++) {
            const currentDate = new Date(startDate);
            currentDate.setMonth(currentDate.getMonth() + i);
            const monthYear = currentDate.toLocaleString('default', { month: 'short', year: '2-digit' });
            labels.push(monthYear);
            balanceData.push(currentBalance);
            currentBalance = Math.max(0, currentBalance - monthlyPayment + (currentBalance * monthlyInterestRate));
        }

        if (payoffChart) {
            payoffChart.destroy();
        }

        payoffChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Balance',
                    data: balanceData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Balance ($)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(value);
                            }
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

    function displayBalanceTransferRecommendation(balance, totalInterest) {
        const recommendationDiv = document.getElementById('balanceTransferRecommendation');
        const potentialSavings = document.getElementById('potentialSavings');
        
        const savings = calculateBalanceTransferSavings(balance, totalInterest);
        potentialSavings.textContent = `$${Math.round(savings)}`;

        recommendationDiv.style.display = 'block';
    }

    function calculateBalanceTransferSavings(balance, totalInterest) {
        // Assuming a 3% balance transfer fee and 21 months of 0% APR
        const transferFee = balance * 0.03;
        const currentMonthlyPayment = parseFloat(document.getElementById('fixedMonthlyPayment').value) || 
                                      (balance / parseFloat(document.getElementById('monthsToPay').value));
        const monthsAtZeroAPR = 21;
        const remainingBalance = Math.max(0, balance - (currentMonthlyPayment * monthsAtZeroAPR));
        const remainingMonths = Math.ceil(remainingBalance / currentMonthlyPayment);
        const remainingInterest = calculateTotalInterest(remainingBalance, currentMonthlyPayment, remainingMonths);

        return Math.max(0, totalInterest - transferFee - remainingInterest);
    }
});
