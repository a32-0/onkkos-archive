type KeyEvent = { nativeEvent: { isComposing: boolean }; keyCode: number };

export const composing = (event: KeyEvent) =>
  event.nativeEvent.isComposing || event.keyCode === 229;
