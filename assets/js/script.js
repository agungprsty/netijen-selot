$(document).ready(function () {
    const symbols = ['🍒', '🍋', '🍉', '7', '⭐', '🍇', '🍊', '🍓', '🔔', '🍀', '🌺', '🌼', '8', '🌠'];
    let spinCount = 0;
    let winCount = 0;
    const maxWins = 2; // Maksimal jumlah kemenangan

    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    function checkWin(symbols) {
        const winPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // Rows
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // Columns
            [0, 4, 8],
            [2, 4, 6] // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (symbols[a] === symbols[b] && symbols[a] === symbols[c]) {
                return true;
            }
        }
        return false;
    }

    function generateReels(winAllowed) {
        const reels = [];
        for (let i = 0; i < 9; i++) {
            reels.push(getRandomSymbol());
        }

        if (!winAllowed && checkWin(reels)) {
            return generateReels(false); // Regenerate reels if win is not allowed and current reels have a winning pattern
        }

        return reels;
    }

    function updateDepositDisplay(deposit) {
        $('#displayDeposit').text(rupiah(deposit));
    }

    function getUserData() {
        return {
            username: Cookies.get('username'),
            deposit: parseInt(Cookies.get('deposit'))
        };
    }

    const rupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR"
        }).format(number);
    }

    $('#registerButton').click(function () {
        const username = $('#username').val();
        const deposit = parseInt($('#deposit').val());

        if (username && deposit >= 5000) {
            Cookies.set('username', username);
            Cookies.set('deposit', deposit);

            $('#displayUsername').text(username);
            updateDepositDisplay(deposit);
            $('#registerForm').hide();
            console.log("Masuk mas");
            $('#instructionsModal').modal('show');
            $('#gamePlay').show();
        } else {
            alert('Username harus diisi dan deposit minimal 1000.');
        }
    });

    $('#playButton').click(function () {
        let userData = getUserData();

        if (isNaN(userData.deposit) || userData.deposit < 5000) {
            alert('Saldo tidak cukup untuk melakukan spin. Isi saldo sekarang!');
            return;
        }

        if (spinCount === 0) {
            userData.deposit -= 5000;
            Cookies.set('deposit', userData.deposit);
            updateDepositDisplay(userData.deposit);
        }

        // Disable the play button until spin is finished
        $('#playButton').prop('disabled', true);

        // Add animation class to reels
        $('.reel').removeClass('reel-animate');
        setTimeout(() => {
            $('.reel').addClass('reel-animate');
        }, 10);

        setTimeout(() => {
            const reels = generateReels(winCount < maxWins);
            for (let i = 0; i < 9; i++) {
                $(`#reel${i + 1}`).text(reels[i]);
            }

            if (checkWin(reels)) {
                $('#result').html(`Selamat! Anda <strong>Menang</strong>. Oh, betapa beruntungnya Anda! Mungkin Anda harus berhenti dari pekerjaan Anda sekarang!`);
                winCount++;

                // Play music
                $(`#backSoundWin`)[0].play();

                // Show sarcastic image modal
                setTimeout(() => {
                    $('#sarcasticWinImage').modal('show');
                }, 2000);
                $('#sarcasticWinImage').modal('hide');
            } else {
                // Play random back sound
                const randomSoundIndex = Math.floor(Math.random() * 3) + 1;
                $(`#backSound${randomSoundIndex}`)[0].play();

                // Show sarcastic image modal
                $('#sarcasticImage').modal('show');
                setTimeout(() => {
                    $('#sarcasticImage').modal('hide');
                }, 2000);

                $('#result').html(`Maaf, Anda <strong>Kalah</strong>. Mungkin kali ini bukan keberuntungan Anda.`);
            }

            spinCount++;

            if (spinCount >= 3) {
                spinCount = 0;
            }

            // Enable the play button after spin is finished
            $('#playButton').prop('disabled', false);
        }, 1000); // Delay to match the animation duration
    });

    $('#topUpButtonConfirm').click(function () {
        const topUpAmount = parseInt($('#topUpAmount').val());

        if (!isNaN(topUpAmount) && topUpAmount > 0) {
            if (topUpAmount >= 9999999) {
                alert("Mentang-mentang game gratis isi saldo seenaknya. \nSaldo mu kebanyakan COKKK!!")
            } else {
                let userData = getUserData();
                userData.deposit += topUpAmount;
                Cookies.set('deposit', userData.deposit);
                updateDepositDisplay(userData.deposit);
            }
            $('#topUpModal').modal('hide');
        } else {
            alert('Masukkan jumlah top up yang valid.');
        }
    });

    // Check if user is already registered
    const userData = getUserData();
    if (userData.username && userData.deposit) {
        $('#displayUsername').text(userData.username);
        updateDepositDisplay(userData.deposit);
        $('#registerForm').hide();
        $('#gamePlay').show();
    }

    if (sessionStorage.getItem('isRefreshed') === 'true') {
        $('#instructionsModal').modal('show');
        sessionStorage.removeItem('isRefreshed'); // Remove the flag after showing the modal
    }

    window.addEventListener('beforeunload', function () {
        sessionStorage.setItem('isRefreshed', 'true');
    });
});