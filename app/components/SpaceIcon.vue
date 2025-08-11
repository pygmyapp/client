<script setup>
    import '~/assets/css/style.css';
</script>
<template>
    <u-tooltip text="Test Space">
        <div :class="{ 
            'bg-stone-900': true, 
            'w-12': true,
            'h-12': true,
            'mt-4': true,
            'mb-4': true,
            'ml-auto': true,
            'mr-auto': true
        }">
    
        </div>
    </u-tooltip>
</template>