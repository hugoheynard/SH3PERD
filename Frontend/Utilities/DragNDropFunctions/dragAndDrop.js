function dragStart(e) {
    //console.log(e.target)
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
    e.target.style.cursor = 'grabbing';
    //console.log(e.target.id) // sert de base à la recup
}

function dragEnd(e) {
    e.target.classList.remove('hide');
    e.target.style.cursor = 'grab';
}

function dragOver(e) {
    e.preventDefault();
    //e.currentTarget.classList.add('dragover');
}

function dragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text');
    const draggable = document.getElementById(id);
    e.currentTarget.appendChild(draggable);
    e.currentTarget.classList.remove('dragover');

    console.log(e.currentTarget.id) // obtiens la position X/Y d'arrivée
    const gridRow = window.getComputedStyle(item).gridRowStart;
    console.log(`Dropped at grid-row: ${gridRow}`);
}


export {dragStart, dragEnd, dragOver, dragLeave, drop};
