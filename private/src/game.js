/** @type {HTMLCanvasElement} */



// get canvas element
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
//setup widith equal to width in css file
const CANVAS_WIDTH = canvas.width = 2400;
const CANVAS_HEIGHT = canvas.height = 720;
const healthElement = document.querySelector(".health")
const levelElement = document.querySelector(".experience")
const levelNumber = document.querySelector(".levelNumber")
let smoothTransition = 15
let playerInvuln = 0
let experience = 0
let level = 1
// load images
const layer1Image = new Image()
layer1Image.src = "images/gameImages/layer-1.png"
const layer2Image = new Image()
layer2Image.src = "images/gameImages/layer-2.png"
const layer3Image = new Image()
layer3Image.src = "images/gameImages/layer-3.png"
const layer4Image = new Image()
layer4Image.src = "images/gameImages/layer-4.png"
const layer5Image = new Image()
layer5Image.src = "images/gameImages/layer-5.png"

const explosionImage1 = new Image()
explosionImage1.src = "images/gameImages/explosions/boom.png"

const playerImage = new Image();
playerImage.src = 'images/gameImages/player_animations.png';

const enemy1Image = new Image();
enemy1Image.src = 'images/gameImages/enemies/enemy1.png';

const enemy2Image = new Image();
enemy2Image.src = 'images/gameImages/enemies/enemy2.png';

const enemy3Image = new Image();
enemy3Image.src = 'images/gameImages/enemies/enemy3.png';

const spriteWidth = 575
const spriteHeight = 523
const enemy1Width = 293
const enemy1Height = 150
const enemy2Width = 265
const enemy2Height = 180

const enemy3Width = 218
const enemy3Height = 168

let gameSpeed = 2

let gameFrame = 0;
const staggerFrames = 10;

class Explosion {
    constructor(x,y,image,maxFrame=5){
        this.x = x;
        this.y = y;
        this.spriteWidth =200;
        this.spriteHeight =179;
        this.width = this.spriteWidth 
        this.height= this.spriteHeight 
        this.image = image
        this.frame = 0
        this.maxFrame = maxFrame
    }
    update(){
        if (gameFrame % (staggerFrames*2) == 0){
            this.frame++
        }
        if (this.frame > this.maxFrame){
            this.frame = 0
        }
        
    }
    draw(){
        let sx = this.spriteWidth * this.frame
        let sy = 0
        let sw = this.spriteWidth
        let sh = this.spriteHeight
        let dx = this.x 
        let dy = this.y
        let dw = this.width 
        let dh = this.height 
        ctx.drawImage(this.image,sx,sy,sw,sh,dx,dy,dw,dh)
    }
}
class Character {
    constructor(name,image,spriteWidth,spriteHeight) {
        this.name = name;
        this.image = image
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.width = this.spriteWidth /3
        this.height = this.spriteHeight /3
        this.state = 'sit'
        this.frame = 5
        this.animationIndex = 0
        this.x = 0
        this.y = 0
        this.health = 100
    }
    createAnimationStates(data) {        
        this.animationStates = []
        let i = 0;
        for(let animationState of data) {
            this.animationStates[i] = {}
            this.animationStates[i]['name'] = Object.keys(animationState)[0]
            this.animationStates[i]['frame'] = Object.values(animationState)[0]
            this.animationStates[i]['animations'] = []
            for (let z=0; z<Object.values(animationState)[0]; z++) {
                
                this.animationStates[i]['animations'].push({'x':z*this.spriteWidth ,'y':i*this.spriteHeight })
            }
            i++
        }
    }
    set_state(state) {
        this.state = state
        for (let animationState of this.animationStates){            
            if (this.state == animationState['name']){                
                this.frame = animationState['frame']
            }
        }
    }
    draw_char() {        
        let sx = 0
        let sy = 0
        
        for (let animationState of this.animationStates){            
            if (this.state == animationState['name']){
                if (this.animationIndex >= this.frame){this.animationIndex  = 0}
                sx = animationState['animations'][this.animationIndex ]['x']
                sy = animationState['animations'][this.animationIndex ]['y']
                if (gameFrame % staggerFrames == 0){
                    this.animationIndex++
                }
            }
        }
        let dx = this.x
        let dy = this.y
        let sw= this.spriteWidth
        let sh = this.spriteHeight
        let dw = this.width
        let dh = this.height
        ctx.drawImage(this.image,sx,sy,sw,sh,dx,dy,dw,dh);
        
    }
}
class Enemy {
    constructor(name,image,spriteWidth,spriteHeight) {
        this.name = name;
        this.image = image
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.width = this.spriteWidth/2.5;
        this.height = this.spriteHeight/2.5;
        this.state = 'sit'
        this.frame = 5
        this.speed = 1
        this.animationIndex = 0
        this.x = Math.random() * 2400 + 2400
        this.y = Math.random() * 400
        this.angle = 0
        this.angleSpeed = Math.random() * 0.2
        this.curve = Math.random() * 5
        this.moveset = 1
    }
    recreate(){
        this.curve = Math.random() * 5
        this.angleSpeed = Math.random() * 0.2
        this.x = Math.random() * 2400 + 2400
        this.y = Math.random() * 400
    }
    createAnimationStates(data) {        
        this.animationStates = []
        let i = 0;
        for(let animationState of data) {
            this.animationStates[i] = {}
            this.animationStates[i]['name'] = Object.keys(animationState)[0]
            this.animationStates[i]['frame'] = Object.values(animationState)[0]
            this.animationStates[i]['animations'] = []
            for (let z=0; z<Object.values(animationState)[0]; z++) {
                
                this.animationStates[i]['animations'].push({'x':z*this.spriteWidth ,'y':i*this.spriteHeight })
            }
            i++
        }
    }
    set_state(state) {
        this.state = state
        for (let animationState of this.animationStates){            
            if (this.state == animationState['name']){                
                this.frame = animationState['frame']
            }
        }
    }
    draw_char() {        
        let sx = 0
        let sy = 0
        
        for (let animationState of this.animationStates){            
            if (this.state == animationState['name']){
                if (this.animationIndex >= this.frame){this.animationIndex  = 0}
                sx = animationState['animations'][this.animationIndex ]['x']
                sy = animationState['animations'][this.animationIndex ]['y']
                if (gameFrame % staggerFrames == 0){
                    this.animationIndex++
                }
            }
        }
        let dx = this.x
        let dy = this.y
        let sw= this.spriteWidth
        let sh = this.spriteHeight
        let dw = this.spriteWidth /2.5
        let dh = this.spriteHeight/2.5
        ctx.drawImage(this.image,sx,sy,sw,sh,dx,dy,dw,dh);
        
    }
    draw(){
        let sx = 0
        let sy = 0
        
        for (let animationState of this.animationStates){            
            if (this.state == animationState['name']){
                if (this.animationIndex >= this.frame){this.animationIndex  = 0}
                sx = animationState['animations'][this.animationIndex ]['x']
                sy = animationState['animations'][this.animationIndex ]['y']                
            }
        }
        let dx = this.x
        let dy = this.y
        let sw= this.spriteWidth
        let sh = this.spriteHeight
        let dw = this.spriteWidth /2.5
        let dh = this.spriteHeight/2.5
        ctx.drawImage(this.image,sx,sy,sw,sh,dx,dy,dw,dh);
    }
    move(){
        if (this.moveset == 1){
            this.x -= this.speed * 2
        }else if(this.moveset == 2){
            this.x -=  this.speed + 2
            this.y += this.curve * Math.sin(this.angle)
            this.angle += this.angleSpeed 
        }else if(this.moveset == 3){
            this.x -=  this.speed * 2  + ( this.curve * Math.cos(this.angle) )
            this.y += this.curve * Math.sin(this.angle)
            this.angle += this.angleSpeed 
        } 
        
    }
}
class Layer {
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 720;
        this.image = image;
        this.speedModifier =speedModifier;
        this.speed = gameSpeed * this.speedModifier
    }
    update(){
        this.speed = gameSpeed * this.speedModifier
        if (this.x <= -this.width){
            this.x = 0
        }
    }
    draw_layer() {
        this.update()
        ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image,this.x+this.width,this.y,this.width,this.height);
    }
}

document.addEventListener('keydown', function(event) {
    const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
    switch (event.key) {
        case "ArrowLeft":
            player.set_state('sit');
            break;
        case "ArrowRight":
            player.set_state('run');
            break;

        case "ArrowUp":
            player.set_state('jump');
            break;
        case "ArrowDown":
            player.set_state('sit');
            break;
        case "d":
            player.set_state('run');
            break;
        case " ":
            player.set_state('jump');
            break;
        case "Control":
            player.set_state('roll');
            break;
    }
});
document.addEventListener('keyup', function(event) {
    const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
    switch (event.key) {
        case "ArrowLeft":
            player.set_state('sit');
            break;
        case "ArrowRight":
            player.set_state('sit');
            break;
        case "ArrowUp":
            player.set_state('sit');
            break;
        case "ArrowDown":
            player.set_state('sit');
            break;
        case "d":
            player.set_state('sit');
            break;
        case " ":
            player.set_state('sit');
            break;
        case "Control":
            player.set_state('sit');
            break;
    }
});

function animate(){    
    //Clear screen
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    
    //Draw Background layers
    for (let layer of backgroundLayers){
        layer.draw_layer();
    }
    //Draw enemies
    for (let enemy of enemies){
        enemy.move();
        enemy.draw();
        if(enemy.x < - 200 || enemy.y < -200) {
            enemy.recreate()
            experience += 4
            levelElement.style = "width: "+ experience +"%;background-color: rgb(19, 9, 73)"
        }
    }
    if (experience > 100){
        level +=1
        experience -= 100
        levelNumber.textContent = "Level " + level
    }
    //Draw Player    
    if (player.state == 'jump'){
        player.y = 150
        player.draw_char();
    }else {
        player.y = 425
        player.draw_char();
    }
    //Update position of everything
    if (gameFrame % staggerFrames == 0){
        if (player.state == 'run' || player.state == 'jump'){
            for (let layer of backgroundLayers){
                layer.x = layer.x - (gameSpeed * layer.speed);
                smoothTransition = 15;
            }
            for (let enemy of enemies){           
                enemy.speed = 2 * enemy.speed
                enemy.move();
                enemy.draw_char();
                enemy.speed = 1       
            }
        }else if (player.state == 'roll'){
            for (let layer of backgroundLayers){
                gameSpeed = 7;
                layer.x = layer.x - (gameSpeed * layer.speed);
                smoothTransition = 15;
            }
            for (let enemy of enemies){           
                enemy.speed = 10 * enemy.speed
                enemy.move();
                enemy.draw_char();
                enemy.speed = 1
            }
        }else if (smoothTransition > 0){
            for (let layer of backgroundLayers){
                layer.x = layer.x - (gameSpeed * layer.speed);
                smoothTransition--
            }
            for (let enemy of enemies){ 
                enemy.move();       
                enemy.draw_char();
            }
        }else{
            for (let enemy of enemies){         
                enemy.draw_char();
            }
        }
   
        gameSpeed = 2.5;
    }
    if (explosion1.frame > 0){
        explosion1.draw()
        explosion1.update()
    }
    for (let enemy of enemies){
        if ((explosion1.frame == 0) && (checkCollision(player,enemy) || checkCollision(enemy,player))){
            explosion1.x = player.x
            explosion1.y = player.y            
            explosion1.draw()
            explosion1.update()
        }
    }
    gameFrame++;
    healthElement.style =  "width: " + player.health + "%; background-color: rgb(116, 194, 92)" 
    if (playerInvuln > 0) {
        playerInvuln = playerInvuln - 1
    }
    if (player.health <=0){
        player.health = 0        
    }else{
        requestAnimationFrame(animate);
    }
};

function main(){    
    animate();
}
function checkCollision(char1,char2){
    if (char1.x <= char2.x && 
        char2.x <= char1.x + char1.width &&
        char1.y >= char2.y && 
        char1.y <= char2.y + char2.height && 
        playerInvuln == 0
        ){
            player.health -= 20
            playerInvuln = 100
            return true
    }else{
        return false
    }
}

const layer1 = new Layer(layer1Image,0.5)
const layer2 = new Layer(layer2Image,1)
const layer3 = new Layer(layer3Image,1.5)
const layer4 = new Layer(layer4Image,2)
const layer5 = new Layer(layer5Image,4)
const backgroundLayers = [layer1,layer2,layer3,layer4,layer5]
const player = new Character("player1",playerImage,spriteWidth,spriteHeight)
const explosion1 = new Explosion(0,0,explosionImage1)
let enemies = []
let enemies1 = []
let enemies2 = []
let enemies3 = []
for (let i =0;i<3;i++){
    enemies1.push(new Enemy("Enemy1",enemy1Image,enemy1Width,enemy1Height))
}
for (let i =0;i<3;i++){
    enemies2.push(new Enemy("Enemy2",enemy2Image,enemy2Width,enemy2Height))
}

for (let i =0;i<3;i++){
    enemies3.push(new Enemy("Enemy3",enemy3Image,enemy3Width,enemy3Height))
}
for (enemy of enemies1){
    enemy.createAnimationStates([{"idle":6}])
    enemy.state = 'idle'
    enemy.frame = 6
    enemies.push(enemy)
}
for (enemy of enemies2){
    enemy.createAnimationStates([{"idle":6}])
    enemy.state = 'idle'
    enemy.frame = 6
    enemy.angle = 0;
    enemy.moveset = 2
    enemies.push(enemy)
}
for (enemy of enemies3){
    enemy.createAnimationStates([{"idle":6}])
    enemy.state = 'idle'
    enemy.frame = 6
    enemy.angle = 0
    enemy.moveset = 3
    enemies.push(enemy)
}

player.createAnimationStates([{"idle":7},{"jump":7},{"fall":7},{"run":9},{"dizzy":11},{"sit":5},{"roll":7},{"bite":7},{"ko":12},{"getHit":4}])


main();