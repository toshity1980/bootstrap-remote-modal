(function (bootstrap) {
    let _modal = null
    let _offcanvas = null

    function request(url, method, formData, onLoad) {
        const req = new XMLHttpRequest()
        req.addEventListener('readystatechange', () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status == 0 || (200 <= req.status && req.status < 400)) {
                    onLoad(req)
                } else {
                    showError(req)
                }
            }
        })
        req.responseType = 'document'
        req.open(method, url)
        req.setRequestHeader('X-Referer', location.href)
        req.send(formData)
    }

    function load(req) {
        if (show(req.response)) {
            return
        }
        if (_modal) {
            bootstrap.Modal.getInstance(_modal).hide()
        }
        if (_offcanvas) {
            bootstrap.Offcanvas.getInstance(_offcanvas).hide()
        }
        showBody(req)
    }

    function show(response) {
        return showModal(response) || showOffcanvas(response)
    }

    function showModal(response) {
        let modalElem = response.getElementsByClassName('modal')[0]
        if (!modalElem) {
            const elem = response.getElementsByClassName('modal-dialog')[0]
            if (elem) {
                modalElem = document.createElement('div')
                modalElem.classList.add('modal', 'fade')
                modalElem.appendChild(elem)
            }
        }
        if (modalElem) {
            if (_modal) {
                _modal.innerHTML = modalElem.innerHTML
            } else {
                _modal = document.body.appendChild(modalElem)
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
                elem.classList.remove('show')
                _offcanvas = document.body.appendChild(elem)
                new bootstrap.Offcanvas(_offcanvas)
            }
            window.setTimeout(() => bootstrap.Offcanvas.getInstance(_offcanvas).show(), 50)
            prepare(_offcanvas)
            return true
        }
    }

    function showBody(req) {
        const body = req.response.documentElement.getElementsByTagName('body')[0]
        if (body) {
            const head = req.response.documentElement.getElementsByTagName('head')[0]
            if (head) {
                document.head.innerHTML = head.innerHTML
            }
            let i = 0
            while (document.body.children.length > i) {
                const elem = document.body.children[i]
                if (elem == _modal || elem == _offcanvas) {
                    i++
                } else {
                    elem.remove()
                }
            }
            while (body.children.length > 0) {
                document.body.appendChild(body.children[0])
            }
            document.dispatchEvent(new Event("DOMContentLoaded"))
        }
    }

    function showError(req) {
        if (req.response.documentElement.innerHTML != '') {
            showBody(req)
        } else {
            alert(req.statusText)
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
        const uri = event.target.href ? event.target.href : event.target.dataset.bsTarget
        if (event.target.dataset.bsToggle == 'remote-modal' && uri) {
            request(uri, 'get', null, load)
            event.preventDefault()
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        document.removeEventListener('click', remoteModal)
        document.addEventListener('click', remoteModal)
    })
})(bootstrap)
