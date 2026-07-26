//go:build darwin && !ios

package main

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Cocoa

#import <Cocoa/Cocoa.h>
#import <objc/runtime.h>
#include <math.h>

static char trafficLightPositionerKey;
static char trafficLightSystemOriginKey;
static char trafficLightLastOriginKey;

@interface WailsTrafficLightPositioner : NSObject {
	NSWindow *_window;
	CGFloat _dx;
	CGFloat _up;
	BOOL _applying;
}

- (instancetype)initWithWindow:(NSWindow *)window
                            dx:(CGFloat)dx
                            up:(CGFloat)up;

- (void)applyPosition;
- (void)windowGeometryChanged:(NSNotification *)notification;

@end

@implementation WailsTrafficLightPositioner

- (instancetype)initWithWindow:(NSWindow *)window
                            dx:(CGFloat)dx
                            up:(CGFloat)up {
	self = [super init];

	if (self) {
		_window = window;
		_dx = dx;
		_up = up;
		_applying = NO;

		NSNotificationCenter *center =
			[NSNotificationCenter defaultCenter];

		// 连续改变窗口尺寸时触发
		[center addObserver:self
		          selector:@selector(windowGeometryChanged:)
		              name:NSWindowDidResizeNotification
		            object:window];

		// 鼠标松开、连续缩放结束时再校正一次
		[center addObserver:self
		          selector:@selector(windowGeometryChanged:)
		              name:NSWindowDidEndLiveResizeNotification
		            object:window];

		// 全屏切换会重新建立标题栏布局
		[center addObserver:self
		          selector:@selector(windowGeometryChanged:)
		              name:NSWindowDidEnterFullScreenNotification
		            object:window];

		[center addObserver:self
		          selector:@selector(windowGeometryChanged:)
		              name:NSWindowDidExitFullScreenNotification
		            object:window];
	}

	return self;
}

- (void)dealloc {
	[[NSNotificationCenter defaultCenter] removeObserver:self];
	[super dealloc];
}

- (void)windowGeometryChanged:(NSNotification *)notification {
	[self applyPosition];
}

- (void)applyPosition {
	if (_applying || _window == nil) {
		return;
	}

	_applying = YES;

	// 让 AppKit 完成当前窗口的约束和标题栏布局
	[_window layoutIfNeeded];

	NSButton *buttons[3] = {
		[_window standardWindowButton:NSWindowCloseButton],
		[_window standardWindowButton:NSWindowMiniaturizeButton],
		[_window standardWindowButton:NSWindowZoomButton],
	};

	for (int i = 0; i < 3; i++) {
		NSButton *button = buttons[i];

		if (button == nil || button.superview == nil) {
			continue;
		}

		NSPoint currentOrigin = button.frame.origin;

		NSValue *systemOriginValue =
			objc_getAssociatedObject(
				button,
				&trafficLightSystemOriginKey
			);

		NSValue *lastOriginValue =
			objc_getAssociatedObject(
				button,
				&trafficLightLastOriginKey
			);

		NSPoint systemOrigin;

		if (systemOriginValue == nil ||
		    lastOriginValue == nil) {
			// 第一次执行时，当前位置就是 AppKit 的系统位置
			systemOrigin = currentOrigin;
		} else {
			NSPoint previousSystemOrigin =
				[systemOriginValue pointValue];

			NSPoint previousAppliedOrigin =
				[lastOriginValue pointValue];

			BOOL appKitChangedPosition =
				fabs(currentOrigin.x -
				     previousAppliedOrigin.x) > 0.25 ||
				fabs(currentOrigin.y -
				     previousAppliedOrigin.y) > 0.25;

			if (appKitChangedPosition) {
				// AppKit 已经重新计算按钮位置
				systemOrigin = currentOrigin;
			} else {
				// 当前仍然是上次设置的位置
				systemOrigin = previousSystemOrigin;
			}
		}

		NSPoint targetOrigin = systemOrigin;

		targetOrigin.x += _dx;

		if (button.superview.isFlipped) {
			targetOrigin.y -= _up;
		} else {
			targetOrigin.y += _up;
		}

		objc_setAssociatedObject(
			button,
			&trafficLightSystemOriginKey,
			[NSValue valueWithPoint:systemOrigin],
			OBJC_ASSOCIATION_RETAIN_NONATOMIC
		);

		objc_setAssociatedObject(
			button,
			&trafficLightLastOriginKey,
			[NSValue valueWithPoint:targetOrigin],
			OBJC_ASSOCIATION_RETAIN_NONATOMIC
		);

		[button setFrameOrigin:targetOrigin];
	}

	_applying = NO;
}

@end

static void installTrafficLightPositioner(
	void *windowPtr,
	double dx,
	double up
) {
	NSWindow *window = (NSWindow *)windowPtr;

	if (window == nil) {
		return;
	}

	WailsTrafficLightPositioner *positioner =
		objc_getAssociatedObject(
			window,
			&trafficLightPositionerKey
		);

	if (positioner == nil) {
		positioner =
			[[WailsTrafficLightPositioner alloc]
				initWithWindow:window
				           dx:dx
				           up:up];

		objc_setAssociatedObject(
			window,
			&trafficLightPositionerKey,
			positioner,
			OBJC_ASSOCIATION_RETAIN_NONATOMIC
		);

		[positioner release];
	}

	[positioner applyPosition];
}
*/
import "C"

import (
	"sync"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

func installTrafficLightOffset(
	window *application.WebviewWindow,
	dx float64,
	up float64,
) {
	var once sync.Once

	window.OnWindowEvent(
		events.Common.WindowShow,
		func(_ *application.WindowEvent) {
			once.Do(func() {
				application.InvokeSync(func() {
					nativeWindow := window.NativeWindow()
					if nativeWindow == nil {
						return
					}

					C.installTrafficLightPositioner(
						nativeWindow,
						C.double(dx),
						C.double(up),
					)
				})
			})
		},
	)
}