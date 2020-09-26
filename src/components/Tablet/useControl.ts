import { get } from "svelte/store"
import { ControlStyle, controlStyles } from "./useSetting"

export const getNextID = (id: number, d: 1 | -1) => {
  const tmp: ControlStyle[] = get(controlStyles)
  const nowIndex = tmp.findIndex(v => v.id === id)
  if (nowIndex === -1) {
    if (tmp.length === 0) {
      alert('コントロールが登録されていません')
      return
    }
    return tmp[0].id
  }
  // 右端の時
  if (nowIndex + 1 === tmp.length) {
    if (d === 1) {
      return tmp[0].id
    }
  }
  // 左端の時
  if (nowIndex === 0) {
    if (d === -1) {
      return tmp[tmp.length - 1].id
    }
  }
  return tmp[nowIndex + d].id
}
