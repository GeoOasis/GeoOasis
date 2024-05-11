<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import {
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarItemIndicator,
    MenubarMenu,
    MenubarPortal,
    MenubarRoot,
    MenubarSeparator,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from 'radix-vue'
import './BoardBar.css'

const currentMenu = ref('')
const checkboxOne = ref(false)
const checkboxTwo = ref(false)
function handleClick() {
    alert('hello!')
    console.log(currentMenu.value);
}
</script>

<template>
    <MenubarRoot v-model="currentMenu" class="MenubarRoot">
        <div class="brand">GeoOasis</div>
        <MenubarMenu value="file">
            <MenubarTrigger class="MenubarTrigger">
                File
            </MenubarTrigger>
            <MenubarPortal>
                <MenubarContent class="MenubarContent" align="start" :side-offset="5" :align-offset="-3">
                    <MenubarItem class="MenubarItem">
                        New Tab
                        <div class="RightSlot">
                            ⌘ T
                        </div>
                    </MenubarItem>
                    <MenubarItem class="MenubarItem">
                        New Window
                        <div class="RightSlot">
                            ⌘ N
                        </div>
                    </MenubarItem>
                    <MenubarItem class="MenubarItem" disabled>
                        New Incognito Window
                    </MenubarItem>
                    <MenubarSeparator class="MenubarSeparator" />
                    <MenubarSub>
                        <MenubarSubTrigger class="MenubarItem">
                            Share
                            <div class="RightSlot">
                                <Icon icon="radix-icons:chevron-right" />
                            </div>
                        </MenubarSubTrigger>
                        <MenubarPortal>
                            <MenubarSubContent class="MenubarContent" :align-offset="-5">
                                <MenubarItem class="MenubarItem">
                                    Email Link
                                </MenubarItem>
                                <MenubarItem class="MenubarItem">
                                    Messages
                                </MenubarItem>
                                <MenubarItem class="MenubarItem">
                                    Notes
                                </MenubarItem>
                            </MenubarSubContent>
                        </MenubarPortal>
                    </MenubarSub>
                    <MenubarSeparator class="MenubarSeparator" />
                    <MenubarItem class="MenubarItem" @click="handleClick">
                        Print…
                        <div class="RightSlot">
                            ⌘ P
                        </div>
                    </MenubarItem>
                </MenubarContent>
            </MenubarPortal>
        </MenubarMenu>

        <MenubarMenu>
            <MenubarTrigger class="MenubarTrigger">
                Edit
            </MenubarTrigger>
            <MenubarPortal>
                <MenubarContent class="MenubarContent" align="start" :side-offset="5" :align-offset="-3">
                    <MenubarItem class="MenubarItem">
                        Undo
                        <div class="RightSlot">
                            ⌘ Z
                        </div>
                    </MenubarItem>
                    <MenubarItem class="MenubarItem">
                        Redo
                        <div class="RightSlot">
                            ⇧ ⌘ Z
                        </div>
                    </MenubarItem>
                    <MenubarSeparator class="MenubarSeparator" />
                    <MenubarSub>
                        <MenubarSubTrigger class="MenubarItem">
                            Find
                            <div class="RightSlot">
                                <Icon icon="radix-icons:chevron-right" />
                            </div>
                        </MenubarSubTrigger>

                        <MenubarPortal>
                            <MenubarSubContent class="MenubarContent" :align-offset="-5">
                                <MenubarItem class="group MenubarItem">
                                    Search the web…
                                </MenubarItem>
                                <MenubarSeparator class="MenubarSeparator" />
                                <MenubarItem class="MenubarItem">
                                    Find…
                                </MenubarItem>
                                <MenubarItem class="MenubarItem">
                                    Find Next
                                </MenubarItem>
                                <MenubarItem class="MenubarItem">
                                    Find Previous
                                </MenubarItem>
                            </MenubarSubContent>
                        </MenubarPortal>
                    </MenubarSub>
                    <MenubarSeparator class="MenubarSeparator" />
                    <MenubarItem class="MenubarItem">
                        Cut
                    </MenubarItem>
                    <MenubarItem class="MenubarItem">
                        Copy
                    </MenubarItem>
                    <MenubarItem class="MenubarItem">
                        Paste
                    </MenubarItem>
                </MenubarContent>
            </MenubarPortal>
        </MenubarMenu>

        <MenubarMenu>
            <MenubarTrigger class="MenubarTrigger">
                View
            </MenubarTrigger>
            <MenubarPortal>
                <MenubarContent class="MenubarContent" align="start" :side-offset="5" :align-offset="-14">
                    <MenubarCheckboxItem v-model="checkboxOne" class="MenubarCheckboxItem">
                        <MenubarItemIndicator class="MenubarItemIndicator">
                            <Icon icon="radix-icons:check" />
                        </MenubarItemIndicator>
                        Show Bookmarks
                        <div class="RightSlot">
                            ⌘+B
                        </div>
                    </MenubarCheckboxItem>
                    <MenubarCheckboxItem v-model="checkboxTwo" class="MenubarCheckboxItem">
                        <MenubarItemIndicator class="MenubarItemIndicator">
                            <Icon icon="radix-icons:check" />
                        </MenubarItemIndicator>
                        Show Full URLs
                    </MenubarCheckboxItem>
                    <MenubarSeparator class="MenubarSeparator" />
                    <MenubarItem class="MenubarItem">
                        Reload
                        <div class="RightSlot">
                            ⌘ R
                        </div>
                    </MenubarItem>
                    <MenubarItem class="MenubarItem" disabled>
                        Force Reload
                        <div class="RightSlot">
                            ⇧ ⌘ R
                        </div>
                    </MenubarItem>
                    <MenubarSeparator class="MenubarSeparator" />
                    <MenubarItem class="MenubarItem">
                        Toggle Fullscreen
                    </MenubarItem>
                    <MenubarSeparator class="MenubarSeparator" />
                    <MenubarItem class="MenubarItem">
                        Hide Sidebar
                    </MenubarItem>
                </MenubarContent>
            </MenubarPortal>
        </MenubarMenu>
    </MenubarRoot>
</template>
