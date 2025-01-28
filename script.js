// back of card - https://deckofcardsapi.com/static/img/back.png
// shuffle cards api https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6 gets deck id
// to draw card https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count=2 use count for amount to draw
// to add to a pile https://deckofcardsapi.com/api/deck/<<deck_id>>/pile/<<pile_name>>/add/?cards=AS,2S

let playerScore = 0;
let dealerScore = 0;
let deckId = "";
const scoreEl = document.getElementById('results');
const dScoreEl = document.getElementById('d-results');
let playerCards = [];
let dealerCards = [];
let canHit = false;
const endResult = document.getElementById('endgame-result');

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
        EndGame();
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
    if(dealerScore <= 21 && playerScore <= 21){
        if(playerScore == dealerScore){
            endResult.textContent = `Draw!`;
        }else if(playerScore != 21 && dealerScore == 21){
            endResult.textContent = `Dealer Got Blackjack!`;
        }else if(dealerScore < playerScore){
            endResult.textContent = `You Win!`;
        }else if(dealerScore > playerScore){
            endResult.textContent = `Dealer Wins!`;
        }
    }else{
        if (playerScore > 21){
            endResult.textContent = "Your Bust!";
        }else if(dealerScore > 21){
            endResult.textContent = "Dealer Bust!";
        }else{
            endResult.textContent = "Something went wrong!";
        }
    }
    setTimeout(() =>{
        const imgs = document.querySelectorAll('img');
    dealerCards = [];
    playerCards = [];
    endResult.style.display = "block";
    playerScore = 0;
    dealerScore = 0;
    setTimeout(() => { StartGame(); }, 2500);
    imgs.forEach((img) => img.remove());
    }, 2000);
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
    endResult.style.display = "none";
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
        DrawCards(deckId, 1).then(cards => {
            ShowFirstDealerCards(cards);
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
    dScoreEl.textContent = dealerScore;

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
    dScoreEl.textContent = dealerScore;

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

function DealerHit(){
    DrawCards(deckId, 1).then(card => {
        ShowDealerCards(card);
        dScoreEl.textContent = dealerScore;
        setTimeout(()=>{
            DealerPlay();
        },1500);
    });
}

function DealerPlay(){
    if(playerScore > dealerScore && dealerScore != 17){
        DealerHit();
    }else if(dealerScore < 12){
        DealerHit();
    }else if(dealerScore < 14){
        if(Math.floor(Math.random() * 2) == 0){
            DealerHit();
        }else{
            EndGame();
        }
    }else if(dealerScore < 15){
        if(Math.floor(Math.random() * 5) == 0){
            DealerHit();
        }else{
            EndGame();
        }
    }else if(dealerScore < 17){
        if(Math.floor(Math.random() * 6) == 0){
            DealerHit();
        }else{
            EndGame();
        }
    }else if(dealerScore >= 17){
        EndGame();
    }
}

function Stand(){
    //play dealers cards
    canHit = false;
    DealerPlay();
    
}

//keep track of score of both cards
//check scores often
//get dealers card when needs to be shown to prevent user cheating with js maniuplation