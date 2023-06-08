/**
 * dom 높이와 스크를 위치에 따라 인피니트 스크롤 이벤트 조건을 발생시키고 마지막 스크롤 위치를 저장하는 hook
 *
 * @param {number} domHeight 스크롤 영역 제외한 화면 상하단 높이
 * @returns {boolean} fetchCond 인피니트 스크롤 이벤트 발생 조건
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Router, { NextRouter } from 'next/router';

interface UseScrollProps {
    domHeight: number;
    router?: any;
    param?: string;
}

interface UseScrollParam {
    fetchCond: boolean;
}

export function useScrollPersist(props: UseScrollProps): UseScrollParam {
    const { domHeight, router, param } = props;
    const [fetchCond, setFireCon] = useState(false);

    // 스크롤 위치 저장
    const saveScrollPos = useCallback(
        (url: string) => {
            if (param) {
                const scrollPos = { x: window.scrollX, y: window.scrollY };
                sessionStorage.setItem(url + `?${param}`, JSON.stringify(scrollPos));
            }
        },
        [param],
    );

    // 재방문 시 마지막 스크롤 위치로 이동
    const restoreScrollPos = useCallback(
        (url: string) => {
            if (param) {
                const sessionItem = sessionStorage.getItem(url + `?${param}`);
                if (sessionItem) {
                    const scrollPos = JSON.parse(sessionItem);
                    if (scrollPos) {
                        setTimeout(() => {
                            window.scrollTo(scrollPos.x, scrollPos.y);
                        }, 0);
                    }
                }
            }
        },
        [param],
    );

    // 스크롤 이벤트
    const onScroll = useCallback(() => {
        const { clientHeight, scrollHeight, scrollTop } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - domHeight) {
            setFireCon(true);
        } else {
            setFireCon(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domHeight]);

    // 스크롤 이벤트 바인딩
    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, [onScroll]);

    useEffect(() => {
        if (!('scrollRestoration' in window.history)) return;
        let shouldScrollRestore = false;
        window.history.scrollRestoration = 'manual';
        if (router) restoreScrollPos(router.asPath);

        // 페이지 이탈 전 스크롤 위치 저장
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (router) saveScrollPos(router.asPath);
            delete event['returnValue'];
        };

        // 라우트 이동 전 스크롤 위치 저장
        const onRouteChangeStart = () => {
            if (router) saveScrollPos(router.asPath);
        };

        // 페이지 재진입시 저장된 스크롤 위치로 이동
        const onRouteChangeComplete = (url: string) => {
            if (shouldScrollRestore) {
                shouldScrollRestore = false;
                restoreScrollPos(url);
            }
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        Router.events.on('routeChangeStart', onRouteChangeStart);
        Router.events.on('routeChangeComplete', onRouteChangeComplete);
        Router.beforePopState(() => {
            shouldScrollRestore = true;
            return true;
        });

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            Router.events.off('routeChangeStart', onRouteChangeStart);
            Router.events.off('routeChangeComplete', onRouteChangeComplete);
            Router.beforePopState(() => true);
        };
    }, [router, restoreScrollPos, saveScrollPos]);

    return { fetchCond };
}
