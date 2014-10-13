/*
    Author: Romulo do Nascimento Ferreira
    E-mail: romulo.nf@mgmail.com
 
    Drag & Drop Table Columns
*/
 
 
/* parameters
 
    id: id of the table that will have drag & drop function
 
*/
 
function dragTable(id, onDrop) {
  // store the cell that will be dragged
  this.draggedCell = null
  // true if ghostTd exists
  this.ghostCreated = false
  // store the table itselfs
  this.table = document.getElementById(id)
  // store every row of the table
  this.tableRows = this.table.getElementsByTagName("tr")
  // create a handler array, usualy the ths in the thead, if not possible the first row of tds
  this.handler = this.table.getElementsByTagName("th").length > 0 ? this.table.getElementsByTagName("th") : this.table.tBodies[0].rows[0].getElementsByTagName("td")
  // create a cell array
  this.cells = this.table.getElementsByTagName("td")
  // store the max index of the column when dropped
  this.maxIndex = this.handler.length
  // store the horizontal mouse position
  this.x;
  // store the vertical mouse position
  this.y;
  // store the index of the column that will be dragged
  this.oldIndex;
  // store the index of the destionation of the column
  this.newIndex;
  //Store the optional method to execute instead of the sortColumn
  this.onDrop = onDrop;
 
  for (x=0; x<this.handler.length; x++) {
    // associate the object with the cells
    this.handler[x].dragObj = this
    // override the default action when mousedown and dragging
    this.handler[x].onselectstart = function() { return false }
    // fire the drag action and return false to prevent default action of selecting the text
    this.handler[x].onmousedown = function(e) { this.dragObj.drag(this,e); return false }
    // visual effect
    this.handler[x].onmouseover = function(e) { this.dragObj.dragEffect(this,e) }
    this.handler[x].onmouseout = function(e) { this.dragObj.dragEffect(this,e) }
    this.handler[x].onmouseup = function(e) { this.dragObj.dragEffect(this,e) }
  }
 
  for (x=0; x<this.cells.length; x++) {
    this.cells[x].dragObj = this
    // visual effect
    this.cells[x].onmouseover = function(e) { this.dragObj.dragEffect(this,e) }
    this.cells[x].onmouseout = function(e) { this.dragObj.dragEffect(this,e) }
    this.cells[x].onmouseup = function(e) { this.dragObj.dragEffect(this,e) }
  }
}
 
dragTable.prototype.dragEffect = function(cell,e) {
  // assign event to variable e
  if (!e) e = window.event
 
  // return if the cell being hovered is the same as the one being dragged
  if (cell.cellIndex == this.oldIndex) return

  else {
    // if there is a cell being dragged
    if (this.draggedCell) {
      // change class to give a visual effect
      e.type == "mouseover" ? this.handler[cell.cellIndex].className = "hovering" : this.handler[cell.cellIndex].className = ""
    }
  }
}
 
dragTable.prototype.drag = function(cell,e) {
  // reference of the cell that is being dragged
  this.draggedCell = cell
   
  // change class for visual effect
  this.draggedCell.className = "dragging"
   
  // store the index of the cell that is being dragged
  this.oldIndex = cell.cellIndex
   
  // create the ghost td
  this.createGhostTd(e)
  // start the engine
  this.dragEngine(true)
}
 
dragTable.prototype.createGhostTd = function(e) {
  // if ghost exists return
  if (this.ghostCreated) return
  // assign event to variable e
  if (!e) e = window.event
  // horizontal position
  this.x = e.pageX ? e.pageX : e.clientX + document.documentElement.scrollLeft
  // vertical position
  this.y = e.pageY ? e.pageY : e.clientY + document.documentElement.scrollTop
 
  // create the ghost td (visual effect)
  this.ghostTd = document.createElement("div")
  this.ghostTd.className = "ghostTd"
  this.ghostTd.style.top = this.y + 5 + "px"
  this.ghostTd.style.left = this.x + 10 + "px"
  // ghost td receives the content of the dragged cell
  this.ghostTd.innerHTML = this.handler[this.oldIndex].innerHTML
  document.getElementsByTagName("body")[0].appendChild(this.ghostTd)
 
  // assign a flag to see if ghost is created
  this.ghostCreated = true
}
 
dragTable.prototype.drop = function(dragObj,e) {
  // assign event to variable e
  if (!e) e = window.event
  // store the target of the event - mouseup
  e.targElm = e.target ? e.target : e.srcElement
   
  // end the engine
  dragObj.dragEngine(false,dragObj)
   
  // remove the ghostTd
  dragObj.ghostTd.parentNode.removeChild(dragObj.ghostTd)
   
  // remove ghost created flag
  this.ghostCreated = false
 
  // store the index of the target, if it have one
  if (e.targElm.cellIndex !="undefined") {
    checkTable = e.targElm
 
      // ascend in the dom beggining in the targeted element and ending in a table or the body tag
      while (checkTable.tagName.toLowerCase() !="table") {
        if (checkTable.tagName.toLowerCase() == "html") break
        checkTable = checkTable.parentNode
      }

      // check if the table where the column was dropped is equal to the object table
      checkTable == this.table ? this.newIndex = e.targElm.cellIndex : false
    }
 
  // start the function to sort the column
  if (this.onDrop) {
    this.onDrop.call(this, this.oldIndex,this.newIndex);
  } else {
    dragObj.sortColumn(this.oldIndex,this.newIndex)    
  }

  // remove visual effect from column being dragged
  this.draggedCell.className = ""
  // clear the variable
  this.draggedCell = null
}
 
dragTable.prototype.sortColumn = function(o,d) {
  // returns if destionation dont have a valid index
  if (d == null) return
  // returns if origin is equals to the destination
  if (o == d) return
 
  // loop through every row
  for (x=0; x<this.tableRows.length; x++) {
    // array with the cells of the row x
    tds = this.tableRows[x].cells
    // remove this cell from the row
    var cell = this.tableRows[x].removeChild(tds[o])
    // insert the cell in the new index
    if (d + 1 >= this.maxIndex) {
      this.tableRows[x].appendChild(cell)
    }
    else {
      this.tableRows[x].insertBefore(cell, tds[d])
    }
  }
}
 
dragTable.prototype.dragEngine = function(boolean,dragObj) {
  var _this = this
  // fire the drop function
  document.documentElement.onmouseup = boolean ? function(e) { _this.drop(_this,e) } : null
  // capture the mouse coords
  document.documentElement.onmousemove = boolean ? function(e) { _this.getCoords(_this,e) } : null
}
 
dragTable.prototype.getCoords = function(dragObj,e) {
  if (!e) e = window.event
 
  // horizontal position
  dragObj.x = e.pageX ? e.pageX : e.clientX + document.documentElement.scrollLeft
  // vertical position
  dragObj.y = e.pageY ? e.pageY : e.clientY + document.documentElement.scrollTop
 
  if (dragObj.ghostTd) {
    // make the ghostTd follow the mouse
    dragObj.ghostTd.style.top = dragObj.y + 5 + "px"
    dragObj.ghostTd.style.left = dragObj.x + 10 + "px"
  }
}
 