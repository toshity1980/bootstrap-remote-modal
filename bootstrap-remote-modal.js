(function () {
    let _modal = null
    let _offcanvas = null

    function request(url, method, formData, onLoad) {
        const req = new XMLHttpRequest()
        req.responseType = 'document'
        req.open(method, url)
        req.send(formData)
        req.addEventListener('load', () => onLoad(req), true)
    }

    function load(req) {
        if (req.status == 200) {
            if (show(req.response)) {
                return
            }
        }
        if (_modal) {
            bootstrap.Modal.getInstance(_modal).hide()
        }
        if (_offcanvas) {
            bootstrap.Offcanvas.getInstance(_offcanvas).hide()
        }
        _modal = _offcanvas = null
        const body = req.response.documentElement.getElementsByTagName('body')[0]
        if (body) {
            document.body.innerHTML = body.innerHTML
            document.dispatchEvent(new Event("DOMContentLoaded"))
        }
    }

    function show(response) {
        return showModal(response) || showOffcanvas(response)
    }

    function showModal(response) {
        const elem = response.getElementsByClassName('modal')[0]
        if (elem) {
            if (_modal) {
                _modal.innerHTML = elem.innerHTML
            } else {
                _modal = document.body.appendChild(elem)
                new bootstrap.Modal(_modal)
            }
            bootstrap.Modal.getInstance(_modal).show()
            prepare(_modal)
            return true
        }
    }

    function showOffcanvas(response) {
        const elem = response.getElementsByClassName('offcanvas')[0]
        if (elem) {
            if (_offcanvas) {
                _offcanvas.innerHTML = elem.innerHTML
            } else {
                _offcanvas = document.body.appendChild(elem)
                new bootstrap.Offcanvas(_offcanvas)
            }
            window.setTimeout(() => bootstrap.Offcanvas.getInstance(_offcanvas).show(), 10)
            prepare(_offcanvas)
            return true
        }
    }

    function prepare(contentElem) {
        for (const elem of contentElem.getElementsByTagName('form')) {
            elem.addEventListener('submit', (event) => {
                request(elem.action, elem.method, new FormData(elem), load)
                event.preventDefault()
            })
        }
        for (const elem of contentElem.getElementsByTagName('a')) {
            elem.addEventListener('click', (event) => {
                request(elem.href, 'get', null, load)
                event.preventDefault()
            })
        }
    }

    function remoteModal(event) {
        if (event.target.dataset.bsToggle == 'remote-modal' && event.target.href) {
            request(event.target.href, 'get', null, load)
            event.preventDefault()
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        document.removeEventListener('click', remoteModal)
        document.addEventListener('click', remoteModal)
    })
})()
