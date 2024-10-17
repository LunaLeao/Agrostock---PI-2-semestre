document.addEventListener('DOMContentLoaded', function() {
    var menuItem = document.querySelectorAll('.item-menu');

    function selectLink() {
        menuItem.forEach((item) =>
            item.classList.remove('ativo')
        );
        this.classList.add('ativo');
    }

    menuItem.forEach((item) =>
        item.addEventListener('click', selectLink)
    );

    // Expandir o menu
    var btnExp = document.querySelector('#btn-exp');
    var menuSide = document.querySelector('.menu-lateral');

    btnExp.addEventListener('click', function() {
        menuSide.classList.toggle('expandir');
    });

    // Highlight active menu item based on current URL
    function highlightActiveMenu() {
        var currentPath = window.location.pathname;
        menuItem.forEach((item) => {
            var link = item.querySelector('a').getAttribute('href');
            if (link === currentPath) {
                item.classList.add('ativo');
            } else {
                item.classList.remove('ativo');
            }
        });
    }

    highlightActiveMenu();
});
