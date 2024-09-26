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
        event.preventDefault(); // Prevent form submission if it's in a form
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
        const interestRate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
        const payoffGoal = document.getElementById('payoffGoal').value;
        let monthlyPayment, monthsToPay;

        console.log('Balance:', balance, 'Interest Rate:', interestRate, 'Payoff Goal:', payoffGoal);

        if (isNaN(balance) || isNaN(interestRate) || balance <= 0 || interestRate < 0) {
            throw new Error('Invalid balance or interest rate');
        }

        if (payoffGoal === 'time') {
            monthsToPay = parseInt(document.getElementById('monthsToPay').value);
            if (isNaN(monthsToPay) || monthsToPay <= 0) {
                throw new Error('Invalid months to pay');
            }
            monthlyPayment = (balance * interestRate * Math.pow(1 + interestRate, monthsToPay)) / (Math.pow(1 + interestRate, monthsToPay) - 1);
        } else {
            monthlyPayment = parseFloat(document.getElementById('fixedMonthlyPayment').value);
            if (isNaN(monthlyPayment) || monthlyPayment <= 0) {
                throw new Error('Invalid fixed monthly payment');
            }
            if (monthlyPayment <= balance * interestRate) {
                throw new Error('Monthly payment is too low to pay off the balance');
            }
            monthsToPay = Math.ceil(Math.log(monthlyPayment / (monthlyPayment - balance * interestRate)) / Math.log(1 + interestRate));
        }

        console.log('Monthly Payment:', monthlyPayment, 'Months to Pay:', monthsToPay);

        const totalInterest = monthlyPayment * monthsToPay - balance;
        const startDate = new Date();
        const payOffDate = new Date(startDate.getTime() + monthsToPay * 30 * 24 * 60 * 60 * 1000);

        displayResults(monthlyPayment, startDate, payOffDate, totalInterest);
        displayPaymentTable(balance, interestRate, monthlyPayment, monthsToPay, totalInterest);
    }

    function displayResults(monthlyPayment, startDate, payOffDate, totalInterest) {
        document.getElementById('monthlyPayment').textContent = monthlyPayment.toFixed(2);
        document.getElementById('startDate').textContent = startDate.toLocaleDateString();
        document.getElementById('payOffDate').textContent = payOffDate.toLocaleDateString();
        document.getElementById('totalInterest').textContent = totalInterest.toFixed(2);
        resultsDiv.style.display = 'block';
    }

    function displayPaymentTable(balance, interestRate, baseMonthlyPayment, baseMonthsToPay, baseTotalInterest) {
        const tableBody = document.getElementById('paymentTableBody');
        tableBody.innerHTML = '';

        for (let i = 0; i <= 4; i++) {
            const extraPayment = baseMonthlyPayment * i * 0.1;
            const monthlyPayment = baseMonthlyPayment + extraPayment;
            let monthsToPay, totalInterest, interestSavings;

            if (monthlyPayment <= balance * interestRate) {
                monthsToPay = 'Never';
                totalInterest = 'N/A';
                interestSavings = 'N/A';
            } else {
                monthsToPay = Math.ceil(Math.log(monthlyPayment / (monthlyPayment - balance * interestRate)) / Math.log(1 + interestRate));
                totalInterest = monthlyPayment * monthsToPay - balance;
                interestSavings = baseTotalInterest - totalInterest;
            }

            const row = tableBody.insertRow();
            row.insertCell(0).textContent = `$${monthlyPayment.toFixed(2)}`;
            row.insertCell(1).textContent = interestSavings === 'N/A' ? 'N/A' : `$${interestSavings.toFixed(2)}`;
            row.insertCell(2).textContent = monthsToPay === 'Never' ? 'Never' : monthsToPay;
        }

        paymentTableDiv.style.display = 'block';
    }
});
