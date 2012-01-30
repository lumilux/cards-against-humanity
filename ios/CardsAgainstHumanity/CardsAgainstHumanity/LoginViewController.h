//
//  LoginViewController.h
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/29/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface LoginViewController : UIViewController
{
    UITextField *nameField;
    UIButton *login;
    UIGestureRecognizer *tap;
}
@property (strong, nonatomic) IBOutlet UITextField *nameField;
@property (strong, nonatomic) IBOutlet UIButton *login;
@property (strong, nonatomic) UIGestureRecognizer *tap;

- (IBAction) login: (id) sender;

@end
