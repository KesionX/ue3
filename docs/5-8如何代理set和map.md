# 如何代理Set和Map

Set

- size
- add
- clear
- delete
- has
- keys
- values
- entries
- forEeach

Map

- size
- clear
- delete
- has
- get
- set
- keys
- values
- entries
- forEeach

整体思路：当读取操作的时候，应该调用track函数建立响应联系，当设置操作的时候，应该调用trigger函数触发响应
