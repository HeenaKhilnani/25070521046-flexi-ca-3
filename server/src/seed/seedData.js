/**
 * Centralized Demonstration Examination Configuration and Questions Bank.
 * To adjust schedules, simply modify the relative day offsets below or set explicit ISO date strings.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getSeededTests(baseDate = new Date()) {
  const now = baseDate.getTime();

  return [
    {
      code: 'DS-201',
      title: 'Data Structures & Algorithms',
      subject: 'Data Structures',
      description: 'Mastery assessment covering linear and non-linear data structures, asymptotic notation, tree traversals, and hashing techniques.',
      instructions: [
        'Total duration for this examination is 25 minutes.',
        'Each question has four options with only one correct choice.',
        'You can move between questions freely before final submission.',
        'Responses are saved automatically upon selection.',
        'The test will automatically finalize when the countdown timer hits zero.'
      ],
      durationMinutes: 25,
      // Available: Started 2 days ago, closes in 30 days
      startTime: new Date(now - 2 * ONE_DAY_MS),
      endTime: new Date(now + 30 * ONE_DAY_MS),
      totalMarks: 30,
      passMarks: 15,
      attemptLimit: 2,
      isPublished: true,
      allowReview: true,
      questions: [
        {
          id: 'ds-q1',
          questionText: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?',
          marks: 5,
          options: [
            { id: 'a', text: 'O(1)' },
            { id: 'b', text: 'O(log n)' },
            { id: 'c', text: 'O(n)' },
            { id: 'd', text: 'O(n log n)' }
          ],
          correctOptionId: 'c',
          explanation: 'In the worst case, an unbalanced BST degenerates into a skewed tree (essentially a linked list), making search time O(n).'
        },
        {
          id: 'ds-q2',
          questionText: 'Which data structure is primarily utilized in implementing Breadth-First Search (BFS) on an unweighted graph?',
          marks: 5,
          options: [
            { id: 'a', text: 'Stack' },
            { id: 'b', text: 'Queue' },
            { id: 'c', text: 'Priority Queue' },
            { id: 'd', text: 'Circular Linked List' }
          ],
          correctOptionId: 'b',
          explanation: 'Breadth-First Search visits vertices level by level, following a First-In-First-Out (FIFO) discipline managed by a Queue.'
        },
        {
          id: 'ds-q3',
          questionText: 'In a hash table with open addressing using linear probing, what primary problem tends to degrade average lookup performance?',
          marks: 5,
          options: [
            { id: 'a', text: 'Thrashing' },
            { id: 'b', text: 'Primary Clustering' },
            { id: 'c', text: 'Dangling Pointers' },
            { id: 'd', text: 'Deadlocks' }
          ],
          correctOptionId: 'b',
          explanation: 'Linear probing suffers from primary clustering, where occupied slots group together in consecutive blocks, increasing probe lengths.'
        },
        {
          id: 'ds-q4',
          questionText: 'Which sorting algorithm guarantees an O(n log n) running time in the worst-case while sorting in-place (O(1) auxiliary space)?',
          marks: 5,
          options: [
            { id: 'a', text: 'Merge Sort' },
            { id: 'b', text: 'Quick Sort' },
            { id: 'c', text: 'Heap Sort' },
            { id: 'd', text: 'Bubble Sort' }
          ],
          correctOptionId: 'c',
          explanation: 'Heap Sort achieves O(n log n) worst-case time complexity and requires only O(1) auxiliary memory because the heap is formed directly in the array.'
        },
        {
          id: 'ds-q5',
          questionText: 'What is the minimum number of queues required to implement a First-In-Last-Out Stack?',
          marks: 5,
          options: [
            { id: 'a', text: '1' },
            { id: 'b', text: '2' },
            { id: 'c', text: '3' },
            { id: 'd', text: '4' }
          ],
          correctOptionId: 'b',
          explanation: 'At least two queues are needed to simulate stack operations by systematically transferring elements to invert FIFO order.'
        },
        {
          id: 'ds-q6',
          questionText: 'In an AVL tree with height h, what is the maximum permissible difference between the heights of the left and right subtrees of any node?',
          marks: 5,
          options: [
            { id: 'a', text: '0' },
            { id: 'b', text: '1' },
            { id: 'c', text: '2' },
            { id: 'd', text: 'log(h)' }
          ],
          correctOptionId: 'b',
          explanation: 'The balance factor in an AVL tree must be -1, 0, or 1. Any node violating this triggers a rotation to restore balance.'
        }
      ]
    },
    {
      code: 'DBMS-301',
      title: 'Database Management Systems',
      subject: 'Database Systems',
      description: 'Comprehensive examination testing understanding of relational algebra, ACID guarantees, SQL queries, normalization up to BCNF, and B+ tree indexing.',
      instructions: [
        'Total time limit is 20 minutes.',
        'All questions carry equal marks (5 marks each).',
        'Review your answers thoroughly before final submission.',
        'Negative marking is not applicable for this session.'
      ],
      durationMinutes: 20,
      // Available: Started 1 day ago, closes in 20 days
      startTime: new Date(now - 1 * ONE_DAY_MS),
      endTime: new Date(now + 20 * ONE_DAY_MS),
      totalMarks: 25,
      passMarks: 12,
      attemptLimit: 1,
      isPublished: true,
      allowReview: true,
      questions: [
        {
          id: 'dbms-q1',
          questionText: 'Which property of database transactions ensures that partially executed transactions are rolled back upon system failure?',
          marks: 5,
          options: [
            { id: 'a', text: 'Atomicity' },
            { id: 'b', text: 'Consistency' },
            { id: 'c', text: 'Isolation' },
            { id: 'd', text: 'Durability' }
          ],
          correctOptionId: 'a',
          explanation: 'Atomicity follows the all-or-nothing principle: either all transaction statements succeed, or the entire transaction is aborted and rolled back.'
        },
        {
          id: 'dbms-q2',
          questionText: 'A relation is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
          marks: 5,
          options: [
            { id: 'a', text: 'Y is a prime attribute' },
            { id: 'b', text: 'X is a candidate key' },
            { id: 'c', text: 'X is a single attribute' },
            { id: 'd', text: 'Y is a foreign key' }
          ],
          correctOptionId: 'b',
          explanation: 'In BCNF, for every non-trivial dependency X -> Y, the determinant X must strictly be a superkey / candidate key.'
        },
        {
          id: 'dbms-q3',
          questionText: 'Why are B+ trees preferred over standard binary search trees for disk-based relational database indexes?',
          marks: 5,
          options: [
            { id: 'a', text: 'They require zero disk space' },
            { id: 'b', text: 'High fanout drastically reduces disk I/O operations' },
            { id: 'c', text: 'They do not support range queries' },
            { id: 'd', text: 'They eliminate the need for write-ahead logging' }
          ],
          correctOptionId: 'b',
          explanation: 'B+ trees have a very high branching factor (fanout), keeping tree depth small (typically 3-4 levels) and minimizing expensive disk block reads.'
        },
        {
          id: 'dbms-q4',
          questionText: 'Which SQL clause is strictly evaluated AFTER group aggregations have been calculated?',
          marks: 5,
          options: [
            { id: 'a', text: 'WHERE' },
            { id: 'b', text: 'HAVING' },
            { id: 'c', text: 'FROM' },
            { id: 'd', text: 'JOIN' }
          ],
          correctOptionId: 'b',
          explanation: 'The WHERE clause filters individual rows before grouping, whereas the HAVING clause filters groups after aggregation.'
        },
        {
          id: 'dbms-q5',
          questionText: 'What kind of lock allows multiple concurrent transactions to read a record while preventing any transaction from modifying it?',
          marks: 5,
          options: [
            { id: 'a', text: 'Exclusive Lock (X)' },
            { id: 'b', text: 'Shared Lock (S)' },
            { id: 'c', text: 'Intent Exclusive Lock (IX)' },
            { id: 'd', text: 'Spin Lock' }
          ],
          correctOptionId: 'b',
          explanation: 'A Shared (Read) Lock permits concurrent reads on the resource but prevents any write operation until all shared locks are released.'
        }
      ]
    },
    {
      code: 'CN-401',
      title: 'Computer Networks & Protocols',
      subject: 'Computer Networks',
      description: 'Scheduled departmental test exploring TCP/IP layers, subnetting, TCP flow control, TLS handshake, and routing protocols.',
      instructions: [
        'Notice: This test is currently UPCOMING and will open automatically on the scheduled opening date.',
        'Duration will be 30 minutes once active.',
        'Review core networking layers prior to commencement.'
      ],
      durationMinutes: 30,
      // Upcoming: Starts in 3 days, closes in 18 days
      startTime: new Date(now + 3 * ONE_DAY_MS),
      endTime: new Date(now + 18 * ONE_DAY_MS),
      totalMarks: 25,
      passMarks: 12,
      attemptLimit: 1,
      isPublished: true,
      allowReview: true,
      questions: [
        {
          id: 'cn-q1',
          questionText: 'How many usable host IP addresses are available in a subnet configured with a /27 CIDR mask?',
          marks: 5,
          options: [
            { id: 'a', text: '32' },
            { id: 'b', text: '30' },
            { id: 'c', text: '62' },
            { id: 'd', text: '28' }
          ],
          correctOptionId: 'b',
          explanation: 'A /27 subnet leaves 32 - 27 = 5 host bits. Total addresses = 2^5 = 32. Subtracting network ID and broadcast yields 30 usable host IPs.'
        },
        {
          id: 'cn-q2',
          questionText: 'Which protocol is responsible for mapping a known IPv4 address to its physical MAC address on a local area network?',
          marks: 5,
          options: [
            { id: 'a', text: 'DNS' },
            { id: 'b', text: 'ARP' },
            { id: 'c', text: 'DHCP' },
            { id: 'd', text: 'ICMP' }
          ],
          correctOptionId: 'b',
          explanation: 'Address Resolution Protocol (ARP) translates an IP network address into a physical hardware (MAC) link-layer address.'
        },
        {
          id: 'cn-q3',
          questionText: 'During the classic 3-way TCP handshake, what flags are set in the second packet sent from server to client?',
          marks: 5,
          options: [
            { id: 'a', text: 'SYN only' },
            { id: 'b', text: 'ACK only' },
            { id: 'c', text: 'SYN + ACK' },
            { id: 'd', text: 'FIN + ACK' }
          ],
          correctOptionId: 'c',
          explanation: 'The server responds to client SYN with a SYN packet acknowledging client sequence number (SYN + ACK).'
        },
        {
          id: 'cn-q4',
          questionText: 'At which layer of the OSI model does a modern stateless IP router predominantly operate?',
          marks: 5,
          options: [
            { id: 'a', text: 'Layer 2 - Data Link' },
            { id: 'b', text: 'Layer 3 - Network' },
            { id: 'c', text: 'Layer 4 - Transport' },
            { id: 'd', text: 'Layer 7 - Application' }
          ],
          correctOptionId: 'b',
          explanation: 'IP routers forward packets based on logical Layer 3 (Network Layer) destination IP addresses.'
        },
        {
          id: 'cn-q5',
          questionText: 'What is the default port utilized by secure HTTPS web communication using TLS/SSL?',
          marks: 5,
          options: [
            { id: 'a', text: '80' },
            { id: 'b', text: '8080' },
            { id: 'c', text: '443' },
            { id: 'd', text: '22' }
          ],
          correctOptionId: 'c',
          explanation: 'Port 443 is the standard registered IANA port for HTTPS traffic encrypted with TLS.'
        }
      ]
    },
    {
      code: 'PF-101',
      title: 'Programming Fundamentals & Logic',
      subject: 'Programming Fundamentals',
      description: 'Foundational programming assessment covering control flow, recursion, scope resolution, memory layouts, and algorithmic reasoning.',
      instructions: [
        'Total examination duration is 15 minutes.',
        '5 questions covering logic and algorithmic foundations.',
        'Answers are saved automatically as you make choices.'
      ],
      durationMinutes: 15,
      // Available: Started 4 days ago, closes in 25 days
      startTime: new Date(now - 4 * ONE_DAY_MS),
      endTime: new Date(now + 25 * ONE_DAY_MS),
      totalMarks: 25,
      passMarks: 12,
      attemptLimit: 3,
      isPublished: true,
      allowReview: true,
      questions: [
        {
          id: 'pf-q1',
          questionText: 'What critical condition must every well-formed recursive function define to prevent infinite recursion and stack overflow?',
          marks: 5,
          options: [
            { id: 'a', text: 'Memory Allocator' },
            { id: 'b', text: 'Base Case' },
            { id: 'c', text: 'Global Variable' },
            { id: 'd', text: 'Type Coercion' }
          ],
          correctOptionId: 'b',
          explanation: 'A base case terminates recursion and provides the return value without generating additional recursive calls on the call stack.'
        },
        {
          id: 'pf-q2',
          questionText: 'Where in memory are local function variables and execution frames typically allocated during program runtime?',
          marks: 5,
          options: [
            { id: 'a', text: 'Call Stack' },
            { id: 'b', text: 'Managed Heap' },
            { id: 'c', text: 'BSS Data Segment' },
            { id: 'd', text: 'ROM' }
          ],
          correctOptionId: 'a',
          explanation: 'Local variables and stack frames are stored in the Call Stack, which grows and shrinks automatically upon function invocation and return.'
        },
        {
          id: 'pf-q3',
          questionText: 'What term describes variables whose scope is strictly restricted to the block or function in which they are declared?',
          marks: 5,
          options: [
            { id: 'a', text: 'Global Scope' },
            { id: 'b', text: 'Block / Local Scope' },
            { id: 'c', text: 'Volatile Scope' },
            { id: 'd', text: 'Dynamic Linkage' }
          ],
          correctOptionId: 'b',
          explanation: 'Block / Local scope confines variable visibility to the containing lexical block or enclosing function.'
        },
        {
          id: 'pf-q4',
          questionText: 'In object-oriented programming, bundling state variables and methods operating on that state while hiding internal details is known as:',
          marks: 5,
          options: [
            { id: 'a', text: 'Polymorphism' },
            { id: 'b', text: 'Encapsulation' },
            { id: 'c', text: 'Inheritance' },
            { id: 'd', text: 'Dynamic Dispatch' }
          ],
          correctOptionId: 'b',
          explanation: 'Encapsulation bundles data with the methods that operate on that data and restricts direct outside access to internal object representation.'
        },
        {
          id: 'pf-q5',
          questionText: 'What is the time complexity of binary search on a sorted array of n elements?',
          marks: 5,
          options: [
            { id: 'a', text: 'O(1)' },
            { id: 'b', text: 'O(log n)' },
            { id: 'c', text: 'O(n)' },
            { id: 'd', text: 'O(n^2)' }
          ],
          correctOptionId: 'b',
          explanation: 'Binary search halves the search interval at each step, yielding logarithmic O(log n) performance.'
        }
      ]
    }
  ];
}
