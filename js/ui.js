document.addEventListener("DOMContentLoaded", function () {
  const elems = document.querySelector(".sidenav");
  M.Sidenav.init(elems, { edge: "left" });

  const forms = document.querySelectorAll(".side-form");
  M.Sidenav.init(forms, { edge: "right" });

  // const inputs = document.querySelectorAll("input#card_name");
  // inputs.characterCounter();
});
