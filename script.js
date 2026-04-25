const wrapper = document.querySelector(".tracker");
const emoji = document.querySelector(".emoji");
const emojiFace = document.querySelector(".emoji-face");

const moveEvent = (e) => {
  const wrapperRect = wrapper.getBoundingClientRect();

  const relX = e.clientX - (wrapperRect.left + wrapperRect.width / 2);
  const relY = e.clientY - (wrapperRect.top + wrapperRect.height / 2);

  const emojiMaxDisplacement = 50;
  const emojiFaceMaxDisplacement = 75;

  gsap.to(emoji, {
    x: (relX / wrapperRect.width) * emojiMaxDisplacement,
    y: (relY / wrapperRect.height) * emojiMaxDisplacement,
    ease: "power3.out",
    duration: 0.35,
  });

  gsap.to(emojiFace, {
    x: (relX / wrapperRect.width) * emojiFaceMaxDisplacement,
    y: (relY / wrapperRect.height) * emojiFaceMaxDisplacement,
    ease: "power3.out",
    duration: 0.35,
  });
};

const leaveEvent = () => {
  gsap.to([emoji, emojiFace], {
    x: 0,
    y: 0,
    ease: "power3.out",
    duration: 1,
  });
};

if (wrapper && emoji && emojiFace) {
  wrapper.addEventListener("mousemove", moveEvent);
  wrapper.addEventListener("mouseleave", leaveEvent);
}

const setupShuffle = (container) => {
  if (!container) return;
  const textNode = container.querySelector(".shuffle-text");
  if (!textNode) return;

  const finalText = container.dataset.text || "";
  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const duration = Number(container.dataset.duration || 0.35);
  const stagger = Number(container.dataset.stagger || 0.03);
  const shuffleTimes = Number(container.dataset.shuffleTimes || 1);
  const ease = container.dataset.ease || "power3.out";
  const respectReducedMotion = container.dataset.respectReducedMotion !== "false";
  const triggerOnce = container.dataset.triggerOnce === "true";
  const shuffleDirection = container.dataset.shuffleDirection || "right";
  let animating = false;
  let playedOnce = false;

  const render = (text) => {
    textNode.innerHTML = "";
    text.split("").forEach((character) => {
      const span = document.createElement("span");
      span.className = "shuffle-char";
      span.textContent = character === " " ? "\u00A0" : character;
      textNode.appendChild(span);
    });
  };

  const randomize = () =>
    finalText
      .split("")
      .map((character) => {
        if (character === " ") return character;
        return randomChars[Math.floor(Math.random() * randomChars.length)];
      })
      .join("");

  const animate = () => {
    if (animating) return;
    if (triggerOnce && playedOnce) return;

    if (respectReducedMotion) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduced.matches) {
        render(finalText);
        playedOnce = true;
        return;
      }
    }

    animating = true;
    const chars = Array.from(textNode.querySelectorAll(".shuffle-char"));
    const totalPasses = Math.max(1, shuffleTimes + 1);
    let pass = 0;

    const runPass = () => {
      const nextText = pass < totalPasses - 1 ? randomize() : finalText;

      nextText.split("").forEach((character, index) => {
        const element = chars[index];
        if (!element) return;
        const delay =
          shuffleDirection === "right"
            ? (chars.length - 1 - index) * stagger
            : index * stagger;

        gsap.fromTo(
          element,
          { x: 10, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration,
            ease,
            delay,
            onStart: () => {
              element.textContent = character === " " ? "\u00A0" : character;
            },
          }
        );
      });

      pass += 1;
      const passTime = duration + chars.length * stagger;

      if (pass < totalPasses) {
        gsap.delayedCall(passTime, runPass);
      } else {
        gsap.delayedCall(passTime, () => {
          animating = false;
          if (triggerOnce) playedOnce = true;
        });
      }
    };

    runPass();
  };

  render(finalText);
  container.addEventListener("mouseenter", animate);
  container.addEventListener("focus", animate);
};

document.querySelectorAll(".shuffle-item").forEach(setupShuffle);
