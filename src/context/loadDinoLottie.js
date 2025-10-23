export const loadDinoLottie = async (type) => {
  switch (type) {
    case "red":
      return import("../assets/lottie/red-t-rex.json");
    case "diplo":
      return import("../assets/lottie/short-diplodocus.json");
    case "ptera":
      return import("../assets/lottie/pteranodon.json");
    case "trice":
      return import("../assets/lottie/triceratops.json");
    case "ankylosaurus":
      return import("../assets/lottie/ankylosaurus.json");
    case "parasaurolophus":
      return import("../assets/lottie/parasaurolophus.json");
    case "stegosaurus":
      return import("../assets/lottie/stegosaurus.json");
    case "spinosaurus":
      return import("../assets/lottie/spinosaurus.json");
    case "t-rex":
      return import("../assets/lottie/t-rex.json");
    case "pachycephalosaurus":
      return import("../assets/lottie/pachycephalosaurus.json");
    default:
      return null;
  }
};
