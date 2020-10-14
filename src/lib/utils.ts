export const sendWSMessageWithID = (
  id: string,
  obj: Object,
  ws: WebSocket
) => {
  try {
    ws.send(JSON.stringify({ ...obj, id: id }))
  } catch (e) {
    console.error(e)
    ws.onopen = () => {
      ws.send(JSON.stringify({ ...obj, id: id }))
      console.log('送れた', JSON.stringify({ ...obj, id: id }))
    }
  }
}
