class HTMLelem {

    constructor(type, id = "", css= "") {
        this.elem = document.createElement(type);
        this.id = id;

        id && this.setId(id);
        css && this.setClass(css);
    };

    setId(id) {
        this.elem.setAttribute('id', id);
    };

    setClass(css) {
        this.elem.setAttribute('class', css);
    };

    setAttributes(obj) {

        for (const attr in obj) {
            this.elem.setAttribute(attr, obj[attr]);
        }

    };

    setText(text) {
        this.elem.textContent = text;
    };

    static addClickAction(element, callback) {
        element.render().addEventListener('click', callback)
    };

    isChildOf(parent) {
        parent.render().appendChild(this.elem);
    }

    render() {
        return this.elem;
    }

}

export {HTMLelem};