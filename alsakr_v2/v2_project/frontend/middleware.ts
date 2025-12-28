export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/command-center/:path*",
        "/vendor/:path*",
        "/product/:path*",
    ],
};
