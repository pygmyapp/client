export default defineWebSocketHandler({
    open(peer) {
        console.log(`Connection opened ${peer.toString()}`)
    },
    message(peer, message) {
        const data = JSON.parse(message.toString());
    },
    close(peer, details) {
        console.log("bye bye")
    },
});