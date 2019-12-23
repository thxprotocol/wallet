<template>
<footer class="region region-navigation">
    <b-nav fill>
        <b-nav-item v-bind:key="route.name" v-for="route in routes" v-bind:to="route.path">
            <span v-if="route.name == 'notifications' && amountOfNewRewards > 0" class="badge badge--warning">
                {{ amountOfNewRewards }}
            </span>
            <img width="20" height="20" v-bind:src="assets[route.name]" alt="Icon" />
            <!-- {{route.name}} -->
        </b-nav-item>
    </b-nav>
</footer>
</template>

<script src="./Footer.ts"></script>
