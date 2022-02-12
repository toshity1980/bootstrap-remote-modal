# bootstrap-remote-modal

bootstrapでリモートコンテンツをModal表示するユーティリティです。
offcanvasにも対応しています。

## 使い方

### 呼び出し元

```html:index.html
<a href="remote.html" data-bs-toggle="remote-modal">text</a>
```

### 呼び出される側(modal)

```html:remote.html
<div class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Modal title</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                modal contents
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary">保存</button>
            </div>
        </div>
    </div>
</div>
```

### 呼び出される側(offcanvas)

```html:offcanvas.html
<div class="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">title</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <p>body</p>
    </div>
</div>
```

## 呼び出される側のコンテンツ

### modalクラスがある場合

modal表示します。コンテンツ内のform送信やリンクは、remote-modal内で表示されるように調節されます。

### offcanvasクラスがある場合

offcanvas表示します。コンテンツ内のform送信やリンクは、remote-modal内で表示されるように調節されます。

### modalもoffcanvasクラスもない場合

modal/offcanvasを非表示にして、bodyタグの内容を入れ替えます。