import "./index.css";

import Vector2 from "./vector2";

const loadImage = url =>
  new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = url;
  });

// const splitImage = (image, row, col) => {
//   const { width, height } = image;
//   const colSize = width / col;
//   const rowSize = height / row;

//   const subImages = [];
//   for (let y = 0; y < row; y++) {
//     for (let x = 0; x < col; x++) {
//       subImages.push({
//         image,
//         width: colSize,
//         height: rowSize,
//         x: colSize * x,
//         y: rowSize * y
//       });
//     }
//   }
//   return subImages;
// };

const init = async () => {
  const players = [
    {
      hp: 100,
      position: new Vector2(100, 100),
      target: new Vector2(100, 100),
      cooldown: 0,
      delay: 1 / 2,
      radius: 20,
      speed: 100,
      shooting: false,
      image: await loadImage("./Hull_01.png")
    },
    {
      hp: 100,
      position: new Vector2(500, 300),
      target: new Vector2(500, 300),
      cooldown: 0,
      delay: 1 / 3,
      radius: 20,
      speed: 100,
      shooting: false,
      image: await loadImage("./Hull_02.png")
    }
  ];

  const canvas = document.getElementById("main");
  const info = document.getElementById("info");
  // const mouse = { x: 0, y: 0 };
  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    players[0].target.set(e.clientX - rect.left, e.clientY - rect.top);
    // mouse.x = e.clientX - rect.left;
    // mouse.y = e.clientY - rect.top;
  });
  // document.addEventListener("keydown", e => {
  //   if (e.keyCode === 40) {
  //     players[0].target.set(players[0].position.x, players[0].position.y + 5);
  //   } else if (e.keyCode === 38) {
  //     players[0].target.set(players[0].position.x, players[0].position.y - 5);
  //   } else if (e.keyCode === 37) {
  //     players[0].target.set(players[0].position.x - 5, players[0].position.y);
  //   } else if (e.keyCode === 39) {
  //     players[0].target.set(players[0].position.x + 5, players[0].position.y);
  //   }
  // });

  canvas.addEventListener("mousedown", () => (players[0].shooting = true));
  canvas.addEventListener("mouseup", () => (players[0].shooting = false));

  const { width, height } = canvas;
  const BULLET_SPEED = 300;
  const bullets = [];

  const createBullet = (from, to, playerIndex) => {
    bullets.push({
      radius: 10,
      damage: 10,
      position: new Vector2(from.x, from.y),
      velocity: new Vector2(to.x, to.y)
        .subVector(from)
        .nor()
        .scale(BULLET_SPEED),
      playerIndex
    });
  };

  const context = canvas.getContext("2d");

  const clear = () => context.clearRect(0, 0, width, height);

  const tmp = new Vector2();

  const processPlayer = (player, playerIndex, delta) => {
    let angle = null;
    if (player.cooldown !== 0) {
      player.cooldown = Math.max(0, player.cooldown - delta);
    }

    if (!player.shooting) {
      angle = Math.atan2(
        player.target.x - player.position.x,
        player.target.y - player.position.y
      );

      if (
        0 < player.target.x &&
        player.target.x < 600 &&
        0 < player.target.y &&
        player.target.y < 400
      ) {
        tmp
          .setVector(player.target)
          .subVector(player.position)
          .nor()
          .scale(player.speed * delta);

        if (player.target.distanceSqr(player.position) <= tmp.len2()) {
          player.position.setVector(player.target);
        } else {
          player.position.addVector(tmp);
        }
      }
    } else {
      for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        angle = Math.atan2(
          bullet.position.x - player.position.x,
          bullet.position.y - player.position.y
        );
      }

      if (player.cooldown === 0) {
        if (playerIndex === 1) {
          createBullet(player.position, players[0].position, playerIndex);
          player.cooldown = player.delay;
        } else {
          if (player.position.x !== player.target.x) {
            createBullet(player.position, player.target, playerIndex);
            player.cooldown = player.delay;
          }
        }
      }
    }

    drawRotated(
      player,
      player.position.x,
      player.position.y,
      angle,
      player.image
    );
  };

  const processBullet = (bullet, delta) => {
    tmp.setVector(bullet.velocity).scale(delta);
    bullet.position.addVector(tmp);
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      const x = bullet.position.x;
      const y = bullet.position.y;
      if (x < 0 || y < 0 || x > width || y > height) {
        bullets.splice(i, 1);
      }
      for (let j = 0; j < players.length; j++) {
        if (bullet.playerIndex !== j) {
          const d1 = (players[j].position.x - x) * (players[j].position.x - x);
          const d2 = (players[j].position.y - y) * (players[j].position.y - y);
          if (
            Math.floor(Math.sqrt(d1 + d2)) <=
            bullet.radius + players[j].radius
          ) {
            bullets.splice(i, 1);
            if (players[j].hp > 0) {
              players[j].hp -= 10;
            }
          }
        }
      }
    }
  };

  const drawBullet = pos => {
    // context.fillStyle = "#ffffff";
    // context.beginPath();
    // context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    // context.fill();
    // context.save();
    // context.setTransform(1, 0, 0, -1, x, y);
    // context.rotate(angle);
    const image = new Image();
    image.src = "./Flame_E.png";
    context.drawImage(image, pos.x, pos.y, 40, 20);
    // context.restore();
  };

  const drawRotated = (player, x, y, angle, image) => {
    context.save();
    context.setTransform(1, 0, 0, -1, x, y);
    context.rotate(angle);
    context.drawImage(image, 0, 0, 600, 400, -20, -20, 90, 60);
    context.restore();
    context.fillStyle = "white";
    context.fillRect(
      player.position.x - 25,
      player.position.y - player.radius - 15,
      50,
      7
    );

    context.fillStyle = player.hp > 50 ? "lime" : "orange";

    context.fillRect(
      player.position.x - 24,
      player.position.y - player.radius - 14,
      player.hp * 0.48,
      5
    );
    context.fillStyle = "white";
    context.fillRect(
      player.position.x - 25,
      player.position.y + player.radius + 19,
      50,
      5
    );
    context.fillStyle = player.cooldown < 0.05 ? "lime" : "orange";

    const readyRatio = (player.delay - player.cooldown) / player.delay;

    context.fillRect(
      player.position.x - 24,
      player.position.y + player.radius + 20,
      48 * readyRatio,
      3
    );
  };

  const update = delta => {
    clear();

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      processPlayer(player, i, delta);
      if (player.hp <= 0) {
        player.shooting = false;
        // clearInterval(interval);
        // interval();
      }
    }

    for (let bullet of bullets) {
      processBullet(bullet, delta);
      drawBullet(bullet.position, bullet.radius);
    }
  };

  setInterval(() => {
    players[1].target.set(Math.random() * 600, Math.random() * 400);
    if (players[1].shooting) {
      players[1].shooting = false;
    } else {
      players[1].shooting = true;
    }
  }, 1500);

  let lastUpdate = Date.now();
  let fps = 0;

  setInterval(() => {
    info.innerHTML = `FPS: ${fps} - Bullets: ${bullets.length}`;
  }, 500);

  (function loop() {
    const delta = Date.now() - lastUpdate;
    lastUpdate = Date.now();
    fps = Math.floor(1000 / delta);
    update(delta / 1000);
    requestAnimationFrame(loop);
  })();
};

init();
