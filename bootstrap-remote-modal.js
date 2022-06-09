(function (bootstrap) {
    let _modal = null
    let _offcanvas = null

    function request(url, method, formData) {
        const xhr = new XMLHttpRequest()
        xhr.addEventListener('loadend', () => {
            render(xhr)
        })
        xhr.responseType = 'document'
        xhr.open(method, url)
        xhr.setRequestHeader('X-Referer', location.href)
        xhr.send(formData)
    }

    function render(xhr) {
        return showModal(xhr.response) ||
            showOffcanvas(xhr.response) ||
            reloadPage(xhr.responseText) ||
            replacePage(xhr.response) ||
            alert(xhr.statusText)
    }

    function showModal(response) {
        const modalElement = getModalContent(response)
        if (modalElement) {
            if (_modal) {
                _modal.innerHTML = modalElement.innerHTML
            } else {
                _modal = document.body.appendChild(modalElement)
                new bootstrap.Modal(_modal)
            }
            bootstrap.Modal.getInstance(_modal).show()
            prepare(_modal)
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
            }
            window.setTimeout(() => bootstrap.Offcanvas.getInstance(_offcanvas).show(), 100)
            prepare(_offcanvas)
            return true
        }
    }

    function reloadPage(responseText) {
        if (responseText === '') {
            location.reload()
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

    function prepare(contentElement) {
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
        const uri = event.target.href ? event.target.href : event.target.dataset.bsTarget
        if (event.target.dataset.bsToggle == 'remote-modal' && uri) {
            request(uri, 'get', null)
            event.preventDefault()
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        document.removeEventListener('click', remoteModal)
        document.addEventListener('click', remoteModal)
    })
})(bootstrap)
