const palette = ["#E8743B","#1F3A5F","#2BB673","#E84B7C","#7C5CE8","#3B9AE8","#E8B53B","#11998e"];
export const col = (i) => palette[i % palette.length];
export const initial = (n) => (n ? n.charAt(0) : '?');
