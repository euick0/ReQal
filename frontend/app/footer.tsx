import React from 'react';
import Link from "next/link";

const Footer = () => {
    return (
        <div className="relative bottom-0 text-center py-1 w-ful bg-backgroundLight font-semibold flex flex-row items-center justify-center gap-4">
            <div>

                <a href="https://reqal.app">ReQal</a> © 2026 by Eric Simões is licensed
                under <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a><img
                src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt=""
                className="inline align-middle max-w-[1em] max-h-[1em] ml-[0.2em]"/><img
                src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt=""
                className="inline align-middle max-w-[1em] max-h-[1em] ml-[0.2em]"/><img
                src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt=""
                className="inline align-middle max-w-[1em] max-h-[1em] ml-[0.2em]"/><img
                src="https://mirrors.creativecommons.org/presskit/icons/nd.svg" alt=""
                className="inline align-middle max-w-[1em] max-h-[1em] ml-[0.2em]"/>
            </div>
            <Link href="/privacy-policy" className="">Privacy Policy</Link>
            <Link href="/terms-of-service" className="">Terms of Service</Link>
        </div>
    );
};

export default Footer;
