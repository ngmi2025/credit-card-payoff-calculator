document.addEventListener('DOMContentLoaded', function() {
    const introRateCheckbox = document.getElementById('introRate');
    const introRateDetails = document.getElementById('introRateDetails');
    const payoffGoalSelect = document.getElementById('payoffGoal');
    const timeGoalDiv = document.getElementById('timeGoal');
    const fixedPaymentDiv = document.getElementById('fixedPayment');
    const calculateButton = document.getElementById('calculate');
    const resultsDiv = document.getElementById('results');
    const paymentTableDiv = document.getElementById('paymentTable');

    introRateCheckbox.addEventListener('change', function() {
        introRateDetails.style.display = this.checked ? 'block' : 'none';
    });

    payoffGoalSelect.addEventListener('change', function() {
        if (this.value === 'time') {
            timeGoalDiv.style.display = 'block';
            fixedPaymentDiv.style.display = 'none';
        } else {
            timeGoalDiv.style.display = 'none';
            fixedPaymentDiv.style.display = 'block';
        }
    });

    calculateButton.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Calculate button clicked');
        try {
            calculatePayoff();
        } catch (error) {
            console.error('Error in calculatePayoff:', error);
            alert('An error occurred while calculating. Please check your inputs and try again.');
        }
    });

    function calculatePayoff() {
        console.log('Starting calculatePayoff function');
        const balance = parseFloat(document.getElementById('balance').value);
        const annualInterestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const monthlyInterestRate = annualInterestRate / 12;
        const payoffGoal = document.getElementById('payoffGoal').value;
        let monthlyPayment, monthsToPay;

        console.log('Balance:', balance, 'Annual Interest Rate:', annualInterestRate, 'Payoff Goal:', payoffGoal);

        if (isNaN(balance) || isNaN(annualInterestRate) || balance <= 0 || annualInterestRate < 0) {
            throw new Error('Invalid balance or interest rate');
        }

        if (payoffGoal === 'time') {
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

        console.log('Monthly Payment:', monthlyPayment, 'Months to Pay:', monthsToPay);

        const totalInterest = calculateTotalInterest(balance, monthlyPayment, monthsToPay);
        const startDate = new Date();
        const payOffDate = new Date(startDate.getTime() + monthsToPay * 30 * 24 * 60 * 60 * 1000);

        displayResults(monthlyPayment, startDate, payOffDate, totalInterest);
        displayPaymentTable(balance, monthlyInterestRate, monthlyPayment, totalInterest);
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
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function displayResults(monthlyPayment, startDate, payOffDate, totalInterest) {
        document.getElementById('monthlyPayment').textContent = `$${Math.round(monthlyPayment)}`;
        document.getElementById('startDate').textContent = formatDate(startDate);
        document.getElementById('payOffDate').textContent = formatDate(payOffDate);
        document.getElementById('totalInterest').textContent = `$${Math.round(totalInterest)}`;
        resultsDiv.style.display = 'block';
    }

    function displayPaymentTable(balance, monthlyInterestRate, baseMonthlyPayment, baseTotalInterest) {
        const tableBody = document.getElementById('paymentTableBody');
        tableBody.innerHTML = '';

        // Calculate base scenario
        const baseMonthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, baseMonthlyPayment);
        const baseTotalInterestRecalculated = calculateTotalInterest(balance, baseMonthlyPayment, baseMonthsToPay);

        // Loop to calculate different payment scenarios
        for (let i = 1; i <= 5; i++) {
            const monthlyPayment = baseMonthlyPayment + (baseMonthlyPayment * i * 0.1);
            const monthsToPay = calculateMonthsToPay(balance, monthlyInterestRate, monthlyPayment);
            
            // Recalculate total interest for this new monthly payment
            const newTotalInterest = calculateTotalInterest(balance, monthlyPayment, monthsToPay);
            
            // Interest savings should be recalculated based on the new total interest
            const interestSavings = baseTotalInterestRecalculated - newTotalInterest;

            // Update the table with correct rounding
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = `$${Math.round(monthlyPayment)}`;
            row.insertCell(1).textContent = `$${Math.round(interestSavings)}`;
            row.insertCell(2).textContent = Math.round(monthsToPay);
        }

        paymentTableDiv.style.display = 'block';
    }
});
