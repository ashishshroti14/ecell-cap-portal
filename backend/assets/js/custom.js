var spons_items = document.querySelectorAll('.sponsor-item');

spons_items.forEach( item => {
    item.addEventListener('mouseover', () => {
        item.classList.add('shadow');
        item.getElementsByTagName('img')[0].classList.remove('shadow');
    });
    item.addEventListener('mouseout', () => {
        item.classList.remove('shadow');
        item.getElementsByTagName('img')[0].classList.add('shadow');
    } );
});