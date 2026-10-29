
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


const startButton = document.getElementById("start");

const menu = document.getElementById("menu");

const winScreen = document.getElementById("win");
const loseScreen = document.getElementById("lose");


const scoreText = document.getElementById("score");
const lifeText = document.getElementById("life");



let playing=false;

let score=0;
let lives=3;

let shake = 0;
let difficulty = 1;
let gameTime = 0;

let slideTimer = 0;


// PLAYER SPRITE

let playerImages=[];

let frame=0;


for(let i=1;i<=8;i++){

    let img=new Image();

    img.src=
    "images/player/brown_side_"+i+".png";

    playerImages.push(img);

}




// PLAYER


const player={

    x:200,

    y:350,

    width:70,

    height:70,

    speed:6,

    velocityY:0,

    jumping:false,

    sliding:false

};





const gravity=.8;

const floor=380;



let keys={};



document.addEventListener(
"keydown",
e=>{

keys[e.key]=true;



if(
(e.key==="ArrowUp" || e.key===" ")
&&
!player.jumping
){

player.velocityY=-15;

player.jumping=true;

}



if(e.key==="ArrowDown"){

player.sliding=true;

player.height=70;

}


});



document.addEventListener(
"keyup",
e=>{


keys[e.key]=false;


if(e.key==="ArrowDown"){

player.sliding=false;

player.height=30;

}

if(e.key==="ArrowDown"){
    player.sliding=true;

    slideTimer=10;

}


});








// ENEMY


let enemy={

x:-100,

y:350,

width:70,

height:70,

speed:0.5

};







// OBSTACLES


let obstacles=[


{

type:"fire",

x:900,

y:420,

width:50,

height:40

},


{

type:"tree",

x:1500,

y:370,

width:120,

height:100

}



];


// CAVE ENDING

let cave = {

    x: 5000,

    y: 280,

    width: 200,

    height: 170

};


let finished = false;



// ROCKS


let rocks=[];


setInterval(()=>{


if(playing){

rocks.push({

x:Math.random()*900,

y:-40,

size:35,

speed:5

});

}


},2000);







// START


startButton.onclick=()=>{

    console.log("Game Started");

    menu.style.display="none";

    playing=true;

    gameLoop();

};







function updatePlayer(){

    if(slideTimer>0){

    slideTimer--;

}
else{

    player.sliding=false;

    player.height=70;

}


if(keys["ArrowRight"])
player.x+=player.speed;


if(keys["ArrowLeft"])
player.x-=player.speed;



player.velocityY+=gravity;


player.y+=player.velocityY;



if(player.y>=floor){

player.y=floor;

player.velocityY=0;

player.jumping=false;

}



}








function updateEnemy(){


enemy.x+=enemy.speed;



if(enemy.x>player.x-100){

damage();

enemy.x=-150;


}


}






function updateObstacles(){


obstacles.forEach(o=>{


o.x-=7;



if(o.x<-100){

o.x=1400;

score+=20;

}



if(hit(player,o)){


damage();


o.x=1400;


}


});


}








function updateRocks(){


rocks.forEach((r,index)=>{


r.y+=r.speed;



if(r.y>500){

rocks.splice(index,1);

}



if(hit(player,r)){


damage();


rocks.splice(index,1);


}


});


}








function damage(){


lives--;

shake=15;

lifeText.innerHTML=
"❤️ Lives: "+lives;



if(lives<=0){

playing=false;

loseScreen.style.display="flex";

}


}

function hit(a,b){


let playerHeight = a.height;


// smaller hitbox when sliding

if(a.sliding){

    playerHeight = 35;

}



return(

a.x < b.x + b.width &&

a.x + a.width > b.x &&

a.y < b.y + b.height &&

a.y + playerHeight > b.y

);


}






function drawBackground(){


ctx.fillStyle="#74c365";

ctx.fillRect(
0,
0,
1000,
500
);



// trees

for(let i=0;i<1000;i+=150){

ctx.fillStyle="#145214";

ctx.fillRect(
i,
200,
70,
200
);


ctx.fillStyle="#754c24";

ctx.fillRect(
i+30,
300,
15,
100
);


}



// ground

ctx.fillStyle="#3b7d32";

ctx.fillRect(
0,
450,
1000,
50
);


}




function drawPlayer(){


let image =
playerImages[
Math.floor(frame/8)%8
];



ctx.save();



if(player.sliding){


    // make character shorter

    ctx.translate(
        player.x,
        player.y+45
    );


    ctx.scale(
        1,
        0.5
    );


    ctx.drawImage(
        image,
        0,
        0,
        70,
        70
    );


}

else{


    // normal running

    ctx.translate(
        player.x+70,
        player.y
    );


    // face right

    ctx.scale(
        -1,
        1
    );


    ctx.drawImage(
        image,
        0,
        0,
        70,
        70
    );


}



ctx.restore();


frame++;

}



function updateEnding(){

    cave.x-=7;
    companions.x-=7;
    stone.x-=7;



    if(player.x > cave.x && !finished){

        finished=true;

        playing=false;


        setTimeout(()=>{

            winScreen.style.display="flex";

        },1500);


    }

}







function drawEnemy(){


    // head

    ctx.fillStyle="#8b0000";

    ctx.fillRect(
        enemy.x+15,
        enemy.y,
        40,
        30
    );


    // body

    ctx.fillStyle="black";

    ctx.fillRect(
        enemy.x+10,
        enemy.y+30,
        50,
        40
    );


    // eyes

    ctx.fillStyle="yellow";

    ctx.fillRect(
        enemy.x+20,
        enemy.y+10,
        8,
        8
    );


    ctx.fillRect(
        enemy.x+40,
        enemy.y+10,
        8,
        8
    );


}


let companions = {

    x:5150,

    y:370,

    width:80,

    height:80

};


let stone = {

    x:2000,

    y:300,

    width:120,

    height:120

};


function drawObstacles(){

    obstacles.forEach(o=>{


        // =================
        // FIRE OBSTACLE
        // =================

        if(o.type==="fire"){


            // fire base

            ctx.fillStyle="#ff8c00";

            ctx.fillRect(
                o.x,
                o.y+25,
                o.width,
                20
            );


            // red flame

            ctx.fillStyle="red";

            ctx.beginPath();

            ctx.moveTo(
                o.x+10,
                o.y+30
            );

            ctx.lineTo(
                o.x+25,
                o.y
            );

            ctx.lineTo(
                o.x+40,
                o.y+30
            );

            ctx.lineTo(
                o.x+55,
                o.y+5
            );

            ctx.lineTo(
                o.x+65,
                o.y+45
            );

            ctx.closePath();

            ctx.fill();



            // yellow inside

            ctx.fillStyle="yellow";

            ctx.fillRect(
                o.x+25,
                o.y+20,
                15,
                25
            );

        }



        // =================
        // FALLEN TREE
        // =================

        if(o.type==="tree"){


            ctx.save();


            ctx.translate(
                o.x,
                o.y
            );


            // rotate fallen tree

            ctx.rotate(-0.25);



            // trunk

            ctx.fillStyle="#5b3214";

            ctx.fillRect(
                0,
                0,
                150,
                35
            );



            // bark lines

            ctx.fillStyle="#3b210d";


            ctx.fillRect(
                30,
                5,
                8,
                25
            );


            ctx.fillRect(
                80,
                5,
                8,
                25
            );



            // leaves

            ctx.fillStyle="#228B22";


            ctx.beginPath();

            ctx.arc(
                150,
                15,
                45,
                0,
                Math.PI*2
            );

            ctx.fill();



            ctx.restore();


        }


    });


}


function drawRocks(){

    rocks.forEach(r=>{


        // rock shadow

        ctx.fillStyle="#444";

        ctx.beginPath();

        ctx.arc(
            r.x+18,
            r.y+20,
            20,
            0,
            Math.PI*2
        );

        ctx.fill();



        // rock highlight

        ctx.fillStyle="#888";

        ctx.fillRect(
            r.x+8,
            r.y+8,
            15,
            10
        );


    });

}

function drawCave(){


    // cave rocks

    ctx.fillStyle = "#555";

    ctx.fillRect(
        cave.x - 30,
        cave.y + 90,
        40,
        80
    );


    ctx.fillRect(
        cave.x + 190,
        cave.y + 90,
        40,
        80
    );



    // mountain/cave wall

    ctx.fillStyle = "#4b3621";

    ctx.fillRect(
        cave.x,
        cave.y,
        200,
        170
    );



    // dark entrance

    ctx.fillStyle = "black";

    ctx.beginPath();

    ctx.arc(
        cave.x + 100,
        cave.y + 120,
        70,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();



    // cave stones

    ctx.fillStyle="#777";


    ctx.fillRect(
        cave.x + 20,
        cave.y + 40,
        25,
        25
    );


    ctx.fillRect(
        cave.x + 150,
        cave.y + 35,
        30,
        25
    );





    // rocks around cave

    ctx.fillStyle="#555";


    ctx.fillRect(
        cave.x-20,
        cave.y+80,
        40,
        80
    );


    ctx.fillRect(
        cave.x+180,
        cave.y+80,
        40,
        80
    );



    // cave mountain

    ctx.fillStyle="#4b3621";


    ctx.fillRect(
        cave.x,
        cave.y,
        200,
        170
    );



    // cave opening

    ctx.fillStyle="#050505";


    ctx.beginPath();

    ctx.arc(
        cave.x+100,
        cave.y+120,
        75,
        Math.PI,
        Math.PI*2
    );

    ctx.fill();



    // cave highlights

    ctx.fillStyle="#777";


    ctx.fillRect(
        cave.x+20,
        cave.y+30,
        25,
        25
    );


    ctx.fillRect(
        cave.x+150,
        cave.y+20,
        30,
        20
    );

}

function drawEnding(){


    // companions

    ctx.fillStyle="yellow";

    ctx.fillRect(

        companions.x,

        companions.y,

        companions.width,

        companions.height

    );



    // stone closes cave

    if(finished){

        ctx.fillStyle="gray";

        ctx.fillRect(

            stone.x,

            stone.y,

            stone.width,

            stone.height

        );

    }


}

function drawJungle(){


    // SKY BACKGROUND

    ctx.fillStyle="#4aa3df";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    // FAR JUNGLE TREES

    for(let i=0;i<10;i++){


        let x = i*120;


        // tree trunk

        ctx.fillStyle="#5b3214";

        ctx.fillRect(
            x+45,
            120,
            30,
            180
        );



        // leaves

        ctx.fillStyle="#0b6623";

        ctx.beginPath();

        ctx.arc(
            x+60,
            100,
            70,
            0,
            Math.PI*2
        );

        ctx.fill();


    }



    // GROUND

    ctx.fillStyle="#3b7a1f";

    ctx.fillRect(
        0,
        300,
        canvas.width,
        200
    );



    // GRASS PIXELS

    ctx.fillStyle="#1f5c16";


    for(let i=0;i<30;i++){

        ctx.fillRect(
            i*40,
            300,
            20,
            10
        );

    }



    // VINES

    ctx.strokeStyle="#0f5c22";

    ctx.lineWidth=5;


    for(let i=0;i<8;i++){

        ctx.beginPath();

        ctx.moveTo(
            i*150,
            0
        );

        ctx.lineTo(
            i*150+30,
            80
        );

        ctx.stroke();

    }


}


function gameLoop(){


if(!playing)
return;

gameTime++;


if(gameTime % 600 === 0){

    difficulty +=0.1;

    enemy.speed +=0.05;

}



ctx.save();


if(shake>0){

ctx.translate(
Math.random()*10-5,
Math.random()*10-5
);

shake--;

}


ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);



drawBackground();

drawJungle();

updatePlayer();

updateEnemy();

updateObstacles();

updateRocks();

drawCave();
drawEnding();



drawPlayer();

drawEnemy();

drawObstacles();

drawRocks();

drawEnding();



score++;

scoreText.innerHTML=
"Score: "+score;



requestAnimationFrame(gameLoop);
ctx.restore();


}