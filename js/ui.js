document.addEventListener("DOMContentLoaded", function () {
  const elems = document.querySelector("#mobile-demo");
  M.Sidenav.init(elems, { edge: "right" });

  const forms = document.querySelector("#side-form");
  M.Sidenav.init(forms, { edge: "left" });

  // const inputs = document.querySelectorAll("input#card_name");
  // inputs.characterCounter();
});

document.addEventListener("DOMContentLoaded", function () {
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals, {});
});

document.addEventListener("DOMContentLoaded", function () {
  const elems = document.querySelectorAll("select");
  M.FormSelect.init(elems, {});
});
