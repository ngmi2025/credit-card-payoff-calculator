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
            if (monthlyPayment <= balance * monthlyInterestRate) {
                throw new Error('Monthly payment is too low to pay off the balance');
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

    function calculateMonthsToPay(balance, monthlyInterestRate, payment) {
        return Math.log(payment / (payment - balance * monthlyInterestRate)) / Math.log(1 + monthlyInterestRate);
    }

    function calculateTotalInterest(balance, monthlyPayment, months) {
        return monthlyPayment * months - balance;
    }

    function formatDate(date) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const year = date.getFullYear().toString().slice(-2);
        return `${months[date.getMonth()]} ${year}`;
    }

    function displayResults(monthlyPayment, startDate, payOffDate, totalInterest) {
        document.getElementById('monthlyPayment').textContent = `$${Math.round(monthlyPayment)}`;
        document.getElementById('startDate').textContent = formatDate(startDate);
        document.getElementById('payOffDate').textContent = formatDate(payOffDate);
        document.getElementById('totalInterest').textContent = `$${Math.round(totalInterest)}`;
        resultsDiv.style.display = 'block';
    }

    function displayPaymentTable(balance, monthlyInterestRate, baseMonthlyPayment, baseTotalInterest, startDate) {
        const tableBody = document.getElementById('paymentTableBody');
        tableBody.innerHTML = '';

        const baseMonthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, baseMonthlyPayment);
        const baseTotalInterestRecalculated = calculateTotalInterest(balance, baseMonthlyPayment, baseMonthsToPay);

        for (let i = 1; i <= 5; i++) {
            const monthlyPayment = baseMonthlyPayment + (baseMonthlyPayment * i * 0.1);
            const monthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, monthlyPayment);
            const newTotalInterest = calculateTotalInterest(balance, monthlyPayment, monthsToPay);
            const interestSavings = baseTotalInterestRecalculated - newTotalInterest;

            const row = tableBody.insertRow();
            row.insertCell(0).textContent = `$${Math.round(monthlyPayment)}`;
            row.insertCell(1).textContent = `$${Math.round(interestSavings)}`;
            row.insertCell(2).textContent = Math.round(monthsToPay);
        }

        paymentTableDiv.style.display = 'block';
    }

    function displayActionableInsight(monthlyPayment, totalInterest, monthsToPay) {
        const increasedPayment = monthlyPayment * 1.2;
        const balance = parseFloat(document.getElementById('balance').value);
        const annualInterestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const monthlyInterestRate = annualInterestRate / 12;
        const newMonthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, increasedPayment);
        const newTotalInterest = calculateTotalInterest(balance, increasedPayment, newMonthsToPay);
        const interestSavings = totalInterest - newTotalInterest;
        const timeSavings = monthsToPay - newMonthsToPay;

        const insightElement = document.getElementById('actionableInsight');
        insightElement.textContent = `By increasing your monthly payment to $${Math.round(increasedPayment)}, you could save $${Math.round(interestSavings)} in interest and pay off your balance ${Math.round(timeSavings)} months earlier.`;
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

    function displayBalanceTransferRecommendation(balance, totalInterest) {
        const recommendationDiv = document.getElementById('balanceTransferRecommendation');
        const potentialSavings = document.getElementById('potentialSavings');
        
        const savings = calculateBalanceTransferSavings(balance, totalInterest);
        potentialSavings.textContent = `$${Math.round(savings)} in interest`;

        recommendationDiv.style.display = 'block';
    }

    function calculateBalanceTransferSavings(balance, totalInterest) {
        // Assuming a 3% balance transfer fee
        const transferFee = balance * 0.03;
        return Math.max(0, totalInterest - transferFee);
    }
});
