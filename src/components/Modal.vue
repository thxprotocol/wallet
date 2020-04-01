<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">
                    <div class="modal-header">
                        <slot name="header"></slot>
                        <button type="button" class="close" aria-label="Close" @click="$emit('close')">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <slot name="body"></slot>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<style lang="scss">
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: auto;
    max-width: 360px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;

    @media (max-width: 360px) {
        margin: 1rem;
    }

    @media (min-width: 768px) {
        max-width: 768px;
    }
}

.modal-header {
    position: relative;
}

.modal-header h3 {
    font-weight: bold;
    margin: 0;
    color: black;
}

.modal-body {
    input {
        width: calc(100% - 1rem - 2px);
        right: 0;
    }

    textarea {
        width: calc(100% - 1rem - 2px);
    }
}

.modal-footer {
    display: block;
    background-color: #efefef;
    text-align: right;

    .btn {
        margin: 0;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;

        &:last-child {
            margin-right: 0;
        }

        @media (max-width: 360px) {
            width: 100%;
        }
    }
}

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}
</style>
