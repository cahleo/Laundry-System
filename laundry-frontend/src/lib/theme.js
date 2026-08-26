export function theme(dark) {
  return dark
    ? {
        bg: "#0E1B2B", surface: "#142236", surfaceAlt: "#182940",
        ink: "#EAF4F6", inkSoft: "#93A8BE", line: "#223650",
        cyan: "#3FC7E3", cyanSoft: "#16374A", coral: "#FF8A73",
        coralSoft: "#3A2420", amber: "#F0B44C", amberSoft: "#3A2E12",
        green: "#3FCB84", greenSoft: "#123A28",
      }
    : {
        bg: "#EAF4F6", surface: "#FFFFFF", surfaceAlt: "#F3FAFC",
        ink: "#142438", inkSoft: "#5A7185", line: "#D3E7EC",
        cyan: "#1FA9C7", cyanSoft: "#E2F6FA", coral: "#FF6F59",
        coralSoft: "#FFE8E4", amber: "#C9860E", amberSoft: "#FCEFD8",
        green: "#2FAE6A", greenSoft: "#E1F6EB",
      };
}
