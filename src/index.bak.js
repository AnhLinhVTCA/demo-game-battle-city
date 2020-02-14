import "./index.css";

import Vector2 from "./vector2";

const loadImage = url =>
  new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = url;
  });

const splitImage = (image, row, col) => {
  const { width, height } = image;
  const colSize = width / col;
  const rowSize = height / row;

  const subImages = [];
  for (let y = 0; y < row; y++) {
    for (let x = 0; x < col; x++) {
      subImages.push({
        image,
        width: colSize,
        height: rowSize,
        x: colSize * x,
        y: rowSize * y
      });
    }
  }
  return subImages;
};

const init = async () => {
  const canvas = document.getElementById("main");
  const info = document.getElementById("info");

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    target.set(e.clientX - rect.left, e.clientY - rect.top);
  });

  const { width, height } = canvas;
  const position = new Vector2(20, 180);
  const target = new Vector2(20, 180);
  const SPEED = 200;

  const context = canvas.getContext("2d");

  const image = await loadImage("./spriteSheet.png");
  const frames = splitImage(image, 4, 2);

  const background = await loadImage("./background.png");

  const clear = () => context.clearRect(0, 0, width, height);

  let positions = Array.from({ length: 1000 }, () => new Vector2(0, 0));
  let velocities = Array.from({ length: 1000 }, () => {
    const ret = new Vector2(1000, 0);
    ret.rotate(Math.random() * 90);
    return ret;
  });

  let stateTime = 0;

  const animationFrames = [2, 4, 6, 3, 5, 7];

  const tmp = new Vector2();

  const update = delta => {
    clear();
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const velocity = velocities[i];

      tmp.setVector(velocity).scale(delta);
      position.addVector(tmp);

      if (position.x > width || position.y > height) {
        position.set(0, 0);
        velocity.set(1000, 0).rotate(Math.random() * 90);
      }
    }

    context.drawImage(background, 0, 0, 600, 400, 0, 0, 600, 400);

    stateTime += delta;
    const frameIndex = Math.floor(stateTime / 0.1) % 6;
    let frame = frames[animationFrames[frameIndex]];

    tmp
      .setVector(target)
      .subVector(position)
      .nor()
      .scale(SPEED * delta);

    if (tmp.len() <= position.distance(target)) {
      position.addVector(tmp);
    } else {
      position.setVector(target);
    }

    // for (let i = 0; i < positions.length; i++) {
    //   const position = positions[i];
    //   context.drawImage(
    //     frame.image,
    //     frame.x,
    //     frame.y,
    //     frame.width,
    //     frame.height,
    //     position.x - 27.5,
    //     position.y - 24,
    //     55,
    //     48
    //   );
    // }
    // for (let i = 0; i < positions.length; i++) {
    //   const position = positions[i];
    //   context.fillRect(position.x, position.y, 10, 10);
    // }

    context.drawImage(
      frame.image,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      position.x - 55,
      position.y - 48,
      110,
      96
    );
  };

  let lastUpdate = Date.now();
  let fps = 0;

  setInterval(() => {
    info.innerHTML = `FPS: ${fps}`;
  }, 1000);

  (function loop() {
    const delta = Date.now() - lastUpdate;
    lastUpdate = Date.now();
    fps = Math.floor(1000 / delta);
    update(delta / 1000);
    requestAnimationFrame(loop);
  })();
};

init();
