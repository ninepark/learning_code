/**
 * 특정 위치로 이동 hook
 * HTMLElement.offsetTop: 요소의 Y축 위치 값(문서 기준). readOnly. ex) offsetLeft, offsetWidth, offsetHeight. position=relative인 부모 요소를 기준. 없다면 최상위 애ㅡ
 * HTMLElement.clientTop: 요소의 Y축 위치 값(부모 기준). readOnly. ex) clientLeft, clientWidth, clientHeight
 * HTMLElement.offsetParent: 첫번째로 매칭되는 부모 선택. 선택 기준 가장 가까운 위치에 있는 position(relative or absolute)의 parent Object를 반환
 * getBoundingClientRect(): viewport 현재 보이는 화면 기준으로 좌표값 반환. scroll 위치 등에 따라 값이 변함. 실시간 동적으로 움직이는 좌표 구할 때 사용
 *
 */

import { useEffect } from 'react';

interface Props {
    targetId?: string;
    targetPositionTop?: number;
    gap?: number;
}

const useScrollToPos = ({ targetId, targetPositionTop, gap = 0 }: Props) => {
    useEffect(() => {
        // 해당 targetId의 offsetTop 결과리턴 함수
        const getOffsetTop = (element: any) => {
            let top = 0;
            if (element?.offsetParent) {
                do {
                    top += element.offsetTop;
                } while ((element = element.offsetParent));
                return top;
            }
        };

        // 해당 위치로 position 위치 이동
        let isMount = true;
        const timer = setTimeout(() => {
            if (isMount) {
                window.scrollTo({
                    top:
                        (targetPositionTop ? targetPositionTop : getOffsetTop(window.document.getElementById(`${targetId}`)) || 0) +
                        gap,
                    behavior: 'auto',
                });
            }
            clearTimeout(timer);
        }, 700);

        return () => {
            isMount = false;
        };
    }, [targetId, targetPositionTop]);
};

export default useScrollToPos;
