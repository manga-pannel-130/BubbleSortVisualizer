    // DOM
    const sizeInput = document.getElementById("size");
    const elementsInput = document.getElementById("elements");
    const barsContainer = document.getElementById("bars-container");
    const generateBtn = document.getElementById("generate");
    const sortBtn = document.getElementById("sort");
    const resetBtn = document.getElementById("reset");
    const speedInput = document.getElementById("speed");

    // Data
    let array = [];
    let isSorting = false;

    // Utility sleep
    const sleep = ms => new Promise(res => setTimeout(res, ms));

    // Create bars from array
    function renderBars() {
      barsContainer.innerHTML = "";
      if (!array || array.length === 0) return;
      array.forEach(value => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        // height scale: clamp to keep visible; use 3px per value but limit max
        const height = Math.max(8, Math.min(320, value * 3));
        bar.style.height = height + "px";

        const label = document.createElement("div");
        label.className = "bar-label";
        label.textContent = value;
        bar.appendChild(label);

        barsContainer.appendChild(bar);
      });
    }

    // Generate array: manual or random
    function generateArray() {
      if (isSorting) return;
      barsContainer.innerHTML = "";
      array = [];

      const manual = elementsInput.value.trim();
      if (manual) {
        // parse manual list
        array = manual.split(",")
          .map(s => Number(s.trim()))
          .filter(n => !Number.isNaN(n));
        if (array.length === 0) {
          alert("Please provide valid comma-separated numbers.");
          return;
        }
        // limit size for UI sanity
        if (array.length > 60) array = array.slice(0, 60);
      } else {
        // random by size
        let size = Number(sizeInput.value) || 12;
        size = Math.max(2, Math.min(60, size));
        for (let i = 0; i < size; i++) {
          array.push(Math.floor(Math.random() * 100) + 1);
        }
      }

      renderBars();
    }

    // Disable/enable controls while sorting
    function setControlsDisabled(state) {
      isSorting = state;
      generateBtn.disabled = state;
      sortBtn.disabled = state;
      resetBtn.disabled = state;
      sizeInput.disabled = state;
      elementsInput.disabled = state;
      speedInput.disabled = state;

      // visual disabled style
      [generateBtn, sortBtn, resetBtn].forEach(btn => {
        btn.style.opacity = state ? "0.6" : "1";
        btn.style.cursor = state ? "not-allowed" : "pointer";
      });
    }

    // Swap DOM bars and array values (visual)
    async function swapBars(bars, i, j) {
      // mark swap
      bars[i].classList.add("swap");
      bars[j].classList.add("swap");

      // small pause to show "swap" color
      await sleep(Math.max(60, Number(speedInput.value) / 4));

      // swap heights & labels in DOM
      const tempH = bars[i].style.height;
      const tempLabel = bars[i].querySelector(".bar-label").textContent;

      bars[i].style.height = bars[j].style.height;
      bars[j].style.height = tempH;

      bars[i].querySelector(".bar-label").textContent = bars[j].querySelector(".bar-label").textContent;
      bars[j].querySelector(".bar-label").textContent = tempLabel;

      // remove swap highlight
      bars[i].classList.remove("swap");
      bars[j].classList.remove("swap");
    }

    // Bubble sort animation
    async function bubbleSort() {
      if (isSorting) return;
      if (!array || array.length < 2) return;

      setControlsDisabled(true);

      const bars = document.querySelectorAll(".bar");
      const n = array.length;

      const baseDelay = Number(speedInput.value) || 400;

      for (let i = 0; i < n - 1; i++) {
        // Each pass, last i elements are sorted
        for (let j = 0; j < n - i - 1; j++) {
          // highlight comparing bars
          bars[j].classList.add("compare");
          bars[j + 1].classList.add("compare");

          await sleep(baseDelay);

          // compare numeric values (from labels)
          const valJ = Number(bars[j].querySelector(".bar-label").textContent);
          const valJ1 = Number(bars[j + 1].querySelector(".bar-label").textContent);

          if (valJ > valJ1) {
            // swap values in array too (keeps array synced)
            const tmp = array[j];
            array[j] = array[j + 1];
            array[j + 1] = tmp;

            // animate swap visually
            await swapBars(bars, j, j + 1);
          }

          // remove compare highlight
          bars[j].classList.remove("compare");
          bars[j + 1].classList.remove("compare");

          await sleep(Math.max(30, baseDelay / 6));
        }

        // mark the last sorted bar
        bars[n - 1 - i].classList.add("sorted");
      }

      // mark all as sorted (for completeness)
      document.querySelectorAll(".bar").forEach(b => b.classList.add("sorted"));

      setControlsDisabled(false);
    }

    // Reset UI
    function resetVisualizer() {
      if (isSorting) return;
      array = [];
      barsContainer.innerHTML = "";
      sizeInput.value = "";
      elementsInput.value = "";
    }

    // Event listeners
    generateBtn.addEventListener("click", generateArray);
    sortBtn.addEventListener("click", bubbleSort);
    resetBtn.addEventListener("click", resetVisualizer);

    // Optional: generate initial random array
    (function initDefault() {
      sizeInput.value = 12;
      generateArray();
    })();
