import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped

rclpy.init(args=None)

node = Node("website_goal_publisher")
goal_publisher = node.create_publisher(PoseStamped, "/goal_pose", 10)

LOCATION_GOALS = {
    "214": {"x": 2.0, "y": 1.0, "z": 0.0, "w": 1.0},
    "206": {"x": 1.0, "y": 1.5, "z": 0.0, "w": 1.0},
    "Registrar": {"x": 3.0, "y": 2.0, "z": 0.0, "w": 1.0},
    "Dean Office": {"x": 4.0, "y": 2.5, "z": 0.0, "w": 1.0},
    "Library": {"x": 5.0, "y": 3.0, "z": 0.0, "w": 1.0},
    "AVR": {"x": 6.0, "y": 3.5, "z": 0.0, "w": 1.0},
}

def publish_goal_pose(location_name: str):
    pose = LOCATION_GOALS.get(location_name)

    if not pose:
        print(f"[ROS2] No dummy coordinates for: {location_name}")
        return False

    msg = PoseStamped()
    msg.header.frame_id = "map"
    msg.header.stamp = node.get_clock().now().to_msg()

    msg.pose.position.x = pose["x"]
    msg.pose.position.y = pose["y"]
    msg.pose.position.z = 0.0

    msg.pose.orientation.x = 0.0
    msg.pose.orientation.y = 0.0
    msg.pose.orientation.z = pose["z"]
    msg.pose.orientation.w = pose["w"]

    goal_publisher.publish(msg)
    print(f"[ROS2] Published PoseStamped to /goal_pose for {location_name}")

    return True
