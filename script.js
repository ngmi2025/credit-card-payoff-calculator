document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payoff-form');
    const resultsDiv = document.getElementById('results');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculatePayoff();
    });

    function calculatePayoff() {
        const balance = parseFloat(document.getElementById('balance').value);
        const apr = parseFloat(document.getElementById('apr').value) / 100 / 12; // Monthly interest rate
        const minPayment = parseFloat(document.getElementById('minPayment').value);
        const customPayment = parseFloat(document.getElementById('customPayment').value) || minPayment;
        const desiredPayoffTime = parseInt(document.getElementById('desiredPayoffTime').value) || 0;

        let months = 0;
        let totalInterest = 0;
        let remainingBalance = balance;
        let payment = customPayment;

        if (desiredPayoffTime > 0) {
            payment = (balance * apr * Math.pow(1 + apr, desiredPayoffTime)) / (Math.pow(1 + apr, desiredPayoffTime) - 1);
            months = desiredPayoffTime;
        } else {
            while (remainingBalance > 0) {
                const interest = remainingBalance * apr;
                totalInterest += interest;
                remainingBalance += interest - payment;
                months++;

                if (remainingBalance < payment) {
                    payment = remainingBalance;
                }
            }
        }

        displayResults(months, totalInterest, payment);
    }

    function displayResults(months, totalInterest, requiredPayment) {
        document.getElementById('payoffTime').textContent = `${Math.floor(months / 12)} years and ${months % 12} months`;
        document.getElementById('totalInterest').textContent = `$${totalInterest.toFixed(2)}`;
        document.getElementById('requiredPayment').textContent = `$${requiredPayment.toFixed(2)}`;
        resultsDiv.classList.remove('hidden');
    }
});