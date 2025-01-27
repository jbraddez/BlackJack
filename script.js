// back of card - https://deckofcardsapi.com/static/img/back.png
// shuffle cards api https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6 gets deck id
// to draw card https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count=2 use count for amount to draw
// to add to a pile https://deckofcardsapi.com/api/deck/<<deck_id>>/pile/<<pile_name>>/add/?cards=AS,2S

let playerScore = 0;
let deckId = "";
const scoreEl = document.getElementById('results');
let playerCards = [];

async function GetDeck() {
    const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6");
    const data = await response.json();
    deckId = data.deck_id;
    return data.deck_id; 
}

async function DrawCards(deckId, count) {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
    const data = await response.json();
    return data.cards.map(card => ({
        code: card.code,
        image: card.image,
        value: card.value,
        suit: card.suit
    }));
}

function CheckScore(){
    if (playerScore > 21){
        playerScore = "Bust!";
        setTimeout(()=>{
            EndGame();
        }, 3000);
    }
}

function EndGame() {
    const body = document.querySelector('body');
    const imgs = document.querySelectorAll('img');
    playerScore = 0;
    playerCards = [];
    imgs.forEach((img) => img.remove());
    setTimeout(() => { StartGame(); }, 2000);
}

function getCardValue(card, currentScore) {
    if (isNaN(playerScore)) {
        playerScore = 0;
    }
    
    if (!isNaN(card.value)) {
        return parseInt(card.value, 10);
    }
    
    if (["KING", "QUEEN", "JACK"].includes(card.value)) {
        return 10;
    }

    if (card.value === "ACE") {
        return (currentScore + 11 > 21) ? 1 : 11;
    }

}

function StartGame() {
    const body = document.querySelector('body');
    const startMenu = document.querySelector('.startmenu');
    const gamePage = document.querySelector('.gamepage');

    body.classList.remove('start');
    startMenu.style.display = 'none';
    gamePage.style.display = 'block';

    GetDeck().then(deckId => {
        console.log("Deck ID:", deckId);
        //players draw
        DrawCards(deckId, 2).then(cards => {
            ShowPlayerCards(cards);
        });
        //dealers draw
        DrawCards(deckId, 1).then(card => {
            ShowFirstDealerCards(card);
        });
    });

}

function ShowPlayerCards(cards) {
    cards.forEach((card, index) => {
        const cardSlot = document.getElementById(`p${index + 1}`) || document.getElementById('p1'); 
        const img = document.createElement('img'); 
        playerCards.push(card)
        img.src = card.image;  
        img.alt = `${card.value} of ${card.suit}`;  
        img.classList.add('card-img');  
        if(playerCards.indexOf(card) > 1){
            img.style.top = `-${playerCards.indexOf(card)*20}px`;
        }
        cardSlot.appendChild(img);
        playerScore += getCardValue(card, playerScore);
        CheckScore();

    });
    scoreEl.textContent = playerScore;
}

function ShowFirstDealerCards(cards) {
    const cardSlot1 = document.getElementById('d1');
    const img = document.createElement('img'); 
    img.src = cards[0].image;  
    img.alt = `${cards[0].value} of ${cards[0].suit}`;
    img.classList.add('card-img');  
    cardSlot1.appendChild(img);

    const cardSlot2 = document.getElementById('d2');
    const backCard = document.createElement('img');
    backCard.src = 'https://deckofcardsapi.com/static/img/back.png';
    backCard.alt = 'Card Back';
    backCard.classList.add('card-img');
    cardSlot2.appendChild(backCard);
}




function Hit(){
    DrawCards(deckId, 1).then(card => {
        ShowPlayerCards(card);
        scoreEl.textContent = playerScore;
    });
}

function Stand(){
    //play dealers cards
}

//keep track of score of both cards
//check scores often
//get dealers card when needs to be shown to prevent user cheating with js maniuplation