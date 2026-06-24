import type { Landmark } from './ergonomics';

// Key BlazePose skeleton connections (torso, arms, legs, head outline).
const CONNECTIONS: [number, number][] = [
  // face/head
  [0, 7], [0, 8],
  // shoulders + torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // left arm
  [11, 13], [13, 15],
  // right arm
  [12, 14], [14, 16],
  // left leg
  [23, 25], [25, 27],
  // right leg
  [24, 26], [26, 28],
  // ears to shoulders (neck line)
  [7, 11], [8, 12],
];

/** Draw the pose skeleton onto a 2D canvas. Landmarks are normalized [0,1]. */
export function drawPose(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number,
  color: string
) {
  ctx.clearRect(0, 0, width, height);
  if (!landmarks?.length) return;

  const px = (lm: Landmark) => ({ x: lm.x * width, y: lm.y * height });
  const visible = (i: number) => (landmarks[i]?.visibility ?? 0) > 0.4;

  // Lines
  ctx.lineWidth = Math.max(2, width * 0.004);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (const [a, b] of CONNECTIONS) {
    if (!visible(a) || !visible(b)) continue;
    const p1 = px(landmarks[a]);
    const p2 = px(landmarks[b]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Joints
  const r = Math.max(3, width * 0.006);
  ctx.fillStyle = color;
  for (let i = 0; i < landmarks.length; i++) {
    if (!visible(i)) continue;
    const p = px(landmarks[i]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}
