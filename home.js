const home = document.getElementById("home");
const btnWorks = document.getElementById("btnWorks");
const homeBg = document.getElementById("homeBg");

btnWorks.addEventListener("click", () => {
  home.classList.add("is-exit");

  const imgSrc = homeBg.currentSrc || homeBg.src;

  sessionStorage.setItem("TRANSITION_HOME", JSON.stringify({
    idx: 0,
    imgSrc
  }));

  setTimeout(() => {
    window.location.href = "index.html";
  }, 220);
});