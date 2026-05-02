// ttt.js – Advanced Neon Tic Tac Toe
// Author: Helal (Credit Locked 🔒)

const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

const LOCKED_AUTHOR = "Helal";
let games = {}; // store active games

// Winning combinations
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Draw Board with Neon Border, X/O, optional win line
function drawBoard(board, winCombo = null) {
  const size = 600;
  const cell = size / 3;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background black
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);

  // Neon border
  ctx.lineWidth = 15;
  ctx.strokeStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 30;
  ctx.strokeRect(5, 5, size - 10, size - 10);

  // Grid lines
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(cell,0); ctx.lineTo(cell,size);
  ctx.moveTo(cell*2,0); ctx.lineTo(cell*2,size);
  ctx.moveTo(0,cell); ctx.lineTo(size,cell);
  ctx.moveTo(0,cell*2); ctx.lineTo(size,cell*2);
  ctx.stroke();

  // Draw X/O or numbers
  ctx.font = "120px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i=0;i<9;i++){
    const x = (i%3)*cell + cell/2;
    const y = Math.floor(i/3)*cell + cell/2;

    if(board[i]===null){
      ctx.fillStyle="#00ffff";
      ctx.shadowColor="#00ffff";
      ctx.shadowBlur=25;
      ctx.fillText((i+1).toString(),x,y);
    } else if(board[i]==="X"){
      ctx.fillStyle="#00ff00"; // Green X
      ctx.shadowColor="#00ff00";
      ctx.shadowBlur=25;
      ctx.fillText("X",x,y);
    } else if(board[i]==="O"){
      ctx.fillStyle="#ff0000"; // Red O
      ctx.shadowColor="#ff0000";
      ctx.shadowBlur=25;
      ctx.fillText("O",x,y);
    }
  }

  // Draw winning line if exists
  if(winCombo){
    const [a,,c] = winCombo;
    const ax = (a%3)*cell + cell/2;
    const ay = Math.floor(a/3)*cell + cell/2;
    const cx = (c%3)*cell + cell/2;
    const cy = Math.floor(c/3)*cell + cell/2;

    ctx.strokeStyle="#ff00ff"; // neon magenta
    ctx.lineWidth=15;
    ctx.shadowColor="#ff00ff";
    ctx.shadowBlur=40;
    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.lineTo(cx,cy);
    ctx.stroke();
  }

  return canvas.toBuffer();
}

// Check Win
function checkWin(board){
  for(let w of wins){
    if(board[w[0]] && board[w[0]]===board[w[1]] && board[w[1]]===board[w[2]]){
      return w;
    }
  }
  return null;
}

// AI move
function botMove(board, bot, user, level){
  let free = board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
  if(level==="easy"){
    return free[Math.floor(Math.random()*free.length)];
  }
  if(level==="normal"){
    // block user if about to win
    for(let f of free){
      let temp=[...board];
      temp[f]=user;
      if(checkWin(temp)) return f;
    }
    return free[Math.floor(Math.random()*free.length)];
  }
  if(level==="hard"){
    // try win
    for(let f of free){
      let temp=[...board];
      temp[f]=bot;
      if(checkWin(temp)) return f;
    }
    // block user
    for(let f of free){
      let temp=[...board];
      temp[f]=user;
      if(checkWin(temp)) return f;
    }
    // random fallback
    return free[Math.floor(Math.random()*free.length)];
  }
}

module.exports={
  config:{
    name:"ttt",
    version:"3.0",
    author:"Helal",
    category:"game",
    shortDescription:"Advanced Neon Tic Tac Toe",
    guide:"/ttt <easy|normal|hard>"
  },

  onStart: async function({message,event,args}){
    if(this.config.author!==LOCKED_AUTHOR) return message.reply("❌ Credit locked!");

    let level = (args[0]||"easy").toLowerCase();
    if(!["easy","normal","hard"].includes(level)) return message.reply("❌ Level must be easy, normal or hard");

    let board = Array(9).fill(null);

    games[event.senderID]={
      board,
      level,
      user:"X",
      bot:"O",
      lastMsg:null
    };

    const buffer = drawBoard(board);
    const out = path.join(__dirname,"ttt_board.png");
    fs.writeFileSync(out,buffer);

    return message.reply({
      body:`🎮 Neon Tic Tac Toe started! Level: ${level.toUpperCase()}\nReply 1-9 to place X.`,
      attachment: fs.createReadStream(out)
    },(err,info)=>{
      games[event.senderID].lastMsg = info.messageID;
    });
  },

  onChat: async function({message,event}){
    const game = games[event.senderID];
    if(!game) return;
    const choice = parseInt(event.body);
    if(!choice||choice<1||choice>9) return;
    let board = game.board;
    if(board[choice-1]!==null) return message.reply("❌ Cell already taken!");

    board[choice-1] = game.user;

    let winCombo = checkWin(board);
    if(winCombo){
      const buffer = drawBoard(board,winCombo);
      const out = path.join(__dirname,"ttt_win.png");
      fs.writeFileSync(out,buffer);
      try{await message.unsend(game.lastMsg);}catch(e){}
      delete games[event.senderID];
      return message.reply({body:"🏆 You Win!",attachment:fs.createReadStream(out)});
    }

    // Bot move
    const move = botMove(board,game.bot,game.user,game.level);
    board[move] = game.bot;

    winCombo = checkWin(board);
    if(winCombo){
      const buffer = drawBoard(board,winCombo);
      const out = path.join(__dirname,"ttt_bot_win.png");
      fs.writeFileSync(out,buffer);
      try{await message.unsend(game.lastMsg);}catch(e){}
      delete games[event.senderID];
      return message.reply({body:"🤖 Bot Wins!",attachment:fs.createReadStream(out)});
    }

    // Draw check
    if(board.every(c=>c!==null)){
      const buffer = drawBoard(board);
      const out = path.join(__dirname,"ttt_draw.png");
      fs.writeFileSync(out,buffer);
      try{await message.unsend(game.lastMsg);}catch(e){}
      delete games[event.senderID];
      return message.reply({body:"🤝 Draw!",attachment:fs.createReadStream(out)});
    }

    // redraw
    const buffer = drawBoard(board);
    const out = path.join(__dirname,"ttt_board.png");
    fs.writeFileSync(out,buffer);

    try{await message.unsend(game.lastMsg);}catch(e){}

    message.reply({body:"🎮 Tic Tac Toe continues...",attachment:fs.createReadStream(out)},(err,info)=>{
      game.lastMsg = info.messageID;
    });
  }
};