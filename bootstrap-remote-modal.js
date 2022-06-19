(function (bootstrap) {
    let _modal = null
    let _offcanvas = null
    let _onClosed = null

    function request(url, method, formData) {
        const xhr = new XMLHttpRequest()
        xhr.addEventListener('loadend', () => {
            render(xhr)
        })
        xhr.responseType = 'text'
        xhr.open(method, url)
        xhr.setRequestHeader('X-Referer', location.href)
        xhr.send(formData)
    }

    function render(xhr) {
        let contentType = xhr.getResponseHeader('Content-Type')
        if (contentType.indexOf('text/html;') == 0) {
            let domParser = new DOMParser()
            let response = domParser.parseFromString(xhr.response, 'text/html')
            return onClosed(response) ||
                showModal(response) ||
                showOffcanvas(response) ||
                replacePage(response) ||
                alert(xhr.statusText)
        } else if (contentType.indexOf('application/json;') == 0) {
            let response = JSON.parse(xhr.response)
            return onClosed(response) ||
                alert(xhr.statusText)
        } else {
            alert(xhr.statusText)
        }
    }

    function onClosed(response) {
        if (_onClosed) {
            _onClosed(response)
            _onClosed = null
            return true
        }
    }

    function showModal(response) {
        const modalElement = getModalContent(response)
        if (modalElement) {
            if (_modal) {
                _modal.innerHTML = modalElement.innerHTML
            } else {
                _modal = document.body.appendChild(modalElement)
                new bootstrap.Modal(_modal)
                prepareEventListener(_modal, 'modal', () => _modal = undefined)
            }
            bootstrap.Modal.getInstance(_modal).show()
            prepareContent(_modal)
            _modal.dispatchEvent(new CustomEvent('loaded.bs.modal', {bubbles: true}))
            return true
        }
    }

    function getModalContent(response) {
        const modal = response.getElementsByClassName('modal')[0]
        if (modal) {
            return modal
        }
        const dialog = response.getElementsByClassName('modal-dialog')[0]
        if (dialog) {
            const modal = document.createElement('div')
            modal.classList.add('modal', 'fade')
            modal.appendChild(dialog)
            return modal
        }
    }

    function showOffcanvas(response) {
        const offcanvas = response.getElementsByClassName('offcanvas')[0]
        if (offcanvas) {
            if (_offcanvas) {
                _offcanvas.innerHTML = offcanvas.innerHTML
            } else {
                offcanvas.classList.remove('show')
                _offcanvas = document.body.appendChild(offcanvas)
                new bootstrap.Offcanvas(_offcanvas)
                prepareEventListener(_offcanvas, 'offcanvas', () => _offcanvas = undefined)
            }
            window.setTimeout(() => bootstrap.Offcanvas.getInstance(_offcanvas).show(), 100)
            prepareContent(_offcanvas)
            _offcanvas.dispatchEvent(new CustomEvent('loaded.bs.offcanvas', {bubbles: true}))
            return true
        }
    }

    function replacePage(response) {
        if (replaceBody(response)) {
            hideModalAndOffcanvas()
            updateHead(response)
            rerunScript()
            document.dispatchEvent(new Event("DOMContentLoaded"))
            return true
        }
    }

    function hideModalAndOffcanvas() {
        if (_modal) {
            bootstrap.Modal.getInstance(_modal).hide()
        }
        if (_offcanvas) {
            bootstrap.Offcanvas.getInstance(_offcanvas).hide()
        }
    }

    function replaceBody(response) {
        const body = response.documentElement.getElementsByTagName('body')[0]
        if (body) {
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
            return true
        }
    }

    function updateHead(response) {
        const head = response.documentElement.getElementsByTagName('head')[0]
        if (head) {
            if (document.head.title != head.title) {
                document.head.title = head.title
            }
            if (document.head.innerHTML != head.innerHTML) {
                document.head.innerHTML = head.innerHTML
            }
            return true
        }
    }

    function rerunScript() {
        document.querySelectorAll('script').forEach(elem => {
            const script = document.createElement('script')
            script.textContent = elem.textContent
            elem.replaceWith(script)
        })
    }

    function prepareEventListener(elem, type, onHidden) {
        elem.addEventListener('shown.bs.' + type, () => {
            let input = elem.querySelector('input:not([type=hidden]),select,textarea')
            if (input) {
                input.focus()
            }
        })
        elem.addEventListener('hidden.bs.' + type, () => {
            document.body.removeChild(elem)
            if (onHidden) {
                onHidden()
            }
        })
    }

    function prepareContent(contentElement) {
        for (const element of contentElement.getElementsByTagName('form')) {
            element.addEventListener('submit', (event) => {
                request(element.action, element.method, new FormData(element))
                event.preventDefault()
            })
        }
        for (const element of contentElement.getElementsByTagName('a')) {
            element.addEventListener('click', (event) => {
                request(element.href, 'get', null)
                event.preventDefault()
            })
        }
    }

    function remoteModal(event) {
        const uri = event.target.href ? event.target.href : event.target.dataset.href
        if (event.target.dataset.toggle == 'remote-modal' && uri) {
            _onClosed = null
            request(uri, 'get', null)
            event.preventDefault()
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        document.removeEventListener('click', remoteModal)
        document.addEventListener('click', remoteModal)
    })

    window.remoteModal = function (href, onClosed) {
        _onClosed = onClosed
        request(href, 'get', null)
    }
})(bootstrap)
