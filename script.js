// back of card - https://deckofcardsapi.com/static/img/back.png
// shuffle cards api https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6 gets deck id
// to draw card https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count=2 use count for amount to draw
// to add to a pile https://deckofcardsapi.com/api/deck/<<deck_id>>/pile/<<pile_name>>/add/?cards=AS,2S

let playerScore = 0;
let dealerScore = 0;
let deckId = "";
const scoreEl = document.getElementById('results');
let playerCards = [];
let dealerCards = [];
let canHit = false;

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
    }else if(playerScore == 21){
        //stand if blackjack
        Stand();
    }
    else{
        setTimeout(()=>{
            canHit = true;
        }, 300);
    }
}

//REMEMBER TO RESET ALL
function EndGame() {
    const imgs = document.querySelectorAll('img');
    playerScore = 0;
    dealerScore = 0;
    dealerCards = [];
    playerCards = [];
    setTimeout(() => { StartGame(); }, 1500);
    imgs.forEach((img) => img.remove());
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
            img.style.top = `-${(playerCards.indexOf(card)-1)*20}px`;
        }
        cardSlot.appendChild(img);
        playerScore += getCardValue(card, playerScore);
        CheckScore();

    });
    scoreEl.textContent = playerScore;
}

function ShowDealerCards(cards) {
    cards.forEach((card)=>{
        dealerCards.push(card); 
        dealerScore += getCardValue(card, dealerScore);
    });
    dealerCards.forEach((card, index) => {
        const cardSlot = document.getElementById(`d${index + 1}`) || document.getElementById('d1'); 
        const img = document.createElement('img'); 
        img.src = card.image;  
        img.alt = `${card.value} of ${card.suit}`;  
        img.classList.add('card-img');  
        if(dealerCards.indexOf(card) > 1){
            img.style.top = `-${(dealerCards.indexOf(card)-1)*20}px`;
        }
        cardSlot.appendChild(img);
        CheckScore();

    });
}

function ShowFirstDealerCards(cards) {
    const cardSlot1 = document.getElementById('d1');
    const img = document.createElement('img'); 
    img.src = cards[0].image;  
    img.alt = `${cards[0].value} of ${cards[0].suit}`;
    img.classList.add('card-img');  
    cardSlot1.appendChild(img);
    dealerScore += getCardValue(cards[0], dealerScore);
    dealerCards.push(cards[0]);

    const cardSlot2 = document.getElementById('d2');
    const backCard = document.createElement('img');
    backCard.id = 'backcard';
    backCard.src = 'https://deckofcardsapi.com/static/img/back.png';
    backCard.alt = 'Card Back';
    backCard.classList.add('card-img');
    cardSlot2.appendChild(backCard);
}

function Hit(){
    if(canHit){
        canHit = false;
    DrawCards(deckId, 1).then(card => {
        ShowPlayerCards(card);
        scoreEl.textContent = playerScore;
    });
}
}

function DealerPlay(){
    if(dealerScore < 12){
        DrawCards(deckId, 1).then(card => {
            ShowDealerCards(card);
            DealerPlay();
        });
    }
}

function Stand(){
    //play dealers cards
    // need dealer logic, e.g. stand on 17, less than 15 = 1/5 to hit, less than 13 = 1/3 to hit, less than 12 OR 11 or less = hit
    // if more than 17 than 1/15 to hit
    canHit = false;
    DealerPlay();
    
}

//keep track of score of both cards
//check scores often
//get dealers card when needs to be shown to prevent user cheating with js maniuplation